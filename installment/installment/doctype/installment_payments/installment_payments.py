# Copyright (c) 2023, ahmedosama.dev@gmail.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import today
import collections
from console import console

import json

class installmentPayments(Document):
	def on_submit(self):
		doc = frappe.new_doc('Sales Invoice')
		doc.company =self.company
		doc.customer =self.customer
		doc.posting_date = self.contract__date
		doc.set_posting_time=1
		if self.contract_type == "تقسيط":
			doc.append("items", {
				'item_code': self.item,
				'qty': 1,
				'rate':self.total_amount
			})
		else:
			for item in self.installment_payments_items:
				doc.append("items", {
					'item_code': item.item,
					'qty': 1,
					'rate':item.price
				})
		# for item in self.payment_installments:
		# 	doc.append("payment_schedule", {
		# 	'invoice_portion': (item.amount *100)/self.total_amount,
		# 	'payment_amount': item.amount,
		# 	'due_date':item.installment_date,
		# 	'description':item.installment_name
		# 	})
		doc.save()
		doc.submit()
		frappe.db.commit()
		self.contract_invoice = doc.name
		self.save()

	@frappe.whitelist()
	def create_payment_entry(self,args):

		item_row = args[0]
		values = args[1]
		collected = 0 
		under_collected = 0
		for item in self.payment_installments:
			if item.payment_status == "Paid":
				collected += item.amount
			else:
				under_collected += item.amount
		if item_row["payment_status"] != "Paid":
			doc = frappe.new_doc('Payment Entry')
			doc.posting_date = values['date']
			doc.company =self.company
			doc.installment_contract = self.installment_contract
			doc.item = self.item
			doc.party_type="Customer"
			doc.party =self.customer
			doc.payment_type ="Receive"
			doc.paid_amount = values["amount"]
			doc.paid_to_account_currency = 'SAR'
			doc.paid_from_account_currency = 'SAR'
			doc.source_exchange_rate = 1
			doc.target_exchange_rate = 1
			doc.mode_of_payment= values['mode_of_payment']
			doc.paid_to = frappe.get_doc("Mode of Payment",values['mode_of_payment']).accounts[0].default_account
			if values.get('reference_no'):
				doc.reference_no = values['reference_no']
			if values.get('reference_date'):
				doc.reference_date = values['reference_date']
			doc.received_amount = values["amount"]
			doc.amount = self.amount
			doc.downpayment = self.downpayment
			doc.total_amount = self.total_amount
			doc.collected = collected+values["amount"]
			doc.under_collected = under_collected-values["amount"]
			doc.collected_no = str(self.total_number_of_installments) + "/" +str(item_row["idx"])
			doc.append("references", {
				'reference_doctype': "Sales Invoice",
				'reference_name': self.contract_invoice,
				'allocated_amount':values["amount"]
			})
			doc.save()
			doc.submit()
			frappe.db.commit()
			
			
			total_collected_amount =self.payment_installments[item_row["idx"]-1].total_collected_amount + values["amount"]
			if values["installment_amount"] == total_collected_amount:
				if len(self.payment_installments) == item_row["idx"] :
					self.contract_status = "مكتمل"
				self.payment_installments[item_row["idx"]-1].payment_status = "Paid"
				self.payment_installments[item_row["idx"]-1].total_collected_amount = total_collected_amount
				self.under_collected = self.under_collected-values["amount"]
				self.collected = self.collected+values["amount"]
				self.collected_no = str(self.total_number_of_installments) + "/" +str(item_row["idx"])

				original_collected_amount=0
				profits_amount = 0
				if self.payment_installments[item_row["idx"]-1].original_amount >=total_collected_amount :
					original_collected_amount = total_collected_amount
					profits_amount = 0
				else:
					original_collected_amount = self.payment_installments[item_row["idx"]-1].original_amount
					profits_amount =   total_collected_amount -self.payment_installments[item_row["idx"]-1].original_amount
				self.append('installment_payments_history', {
							'installment_name':item_row["installment_name"] ,
							'collected_date': values['date'],
							'collected_amount': values["amount"],
							'orignal_collected_amount': original_collected_amount,
							'profits_collected_amount':profits_amount,
							'payment_refrance':str(doc.name)
						})
				self.payment_installments[item_row["idx"]-1].original_collected_amount = original_collected_amount
				self.payment_installments[item_row["idx"]-1].profits_collected_amount = profits_amount
				
				g_original_collected_amount = 0
				g_profits_collected_amount = 0
				for itemss in self.payment_installments:
					g_original_collected_amount += itemss.original_collected_amount
					g_profits_collected_amount += itemss.profits_collected_amount
				self.original_collected_amount = g_original_collected_amount
				self.profits_collected_amount = g_profits_collected_amount
				self.save()

				frappe.msgprint("لقد تم تحصيل القسط")
			else:
				self.payment_installments[item_row["idx"]-1].total_collected_amount = total_collected_amount
				self.under_collected = self.under_collected-values["amount"]
				self.collected = self.collected+values["amount"]

				original_collected_amount=0
				profits_amount = 0
				if self.payment_installments[item_row["idx"]-1].original_amount >=total_collected_amount :
					original_collected_amount = total_collected_amount
					profits_amount = 0
				else:
					original_collected_amount = self.payment_installments[item_row["idx"]-1].original_amount
					profits_amount = total_collected_amount -self.payment_installments[item_row["idx"]-1].original_amount
				self.append('installment_payments_history', {
							'installment_name':item_row["installment_name"] ,
							'collected_date': values['date'],
							'collected_amount': values["amount"],
							'orignal_collected_amount': original_collected_amount,
							'profits_collected_amount':profits_amount,
							'payment_refrance':str(doc.name)
						})
				self.payment_installments[item_row["idx"]-1].original_collected_amount = original_collected_amount
				self.payment_installments[item_row["idx"]-1].profits_collected_amount = profits_amount

				g_original_collected_amount = 0
				g_profits_collected_amount = 0
				for itemss in self.payment_installments:
					g_original_collected_amount += itemss.original_collected_amount
					g_profits_collected_amount += itemss.profits_collected_amount
				self.original_collected_amount = g_original_collected_amount
				self.profits_collected_amount = g_profits_collected_amount
				self.save()
		else:
			frappe.msgprint("انت بالفعل حصلت هذا القسط!")
		return str(doc.name)
		
		
	@frappe.whitelist()
	def update_caculations(self,args):
		self.reload()
		collected = 0 
		under_collected = 0
		for item in self.payment_installments:
			if item.payment_status == "Paid":
				collected += item.amount
			else:
				under_collected += item.amount
		frappe.db.set_value("installment Payments",self.name,"collected",collected)
		frappe.db.set_value("installment Payments",self.name,"under_collected",under_collected)




	@frappe.whitelist()
	def create_payment_entry_2(self,values,col=None):
		doc = frappe.new_doc('Payment Entry')
		
		doc.posting_date = values[0]['date']
		doc.company =self.company
		doc.installment_contract = self.installment_contract
		doc.mode_of_payment = values[0]['mode_of_payment']
		doc.item = self.item
		doc.party_type="Customer"
		doc.party =self.customer
		doc.payment_type ="Receive"
		doc.paid_amount = values[0]['amount']
		if 'reference_date' in values[0]:
			doc.reference_date=values[0]['reference_date']
		if 'reference_no' in values[0]:
			doc.reference_no=values[0]['reference_no']
		doc.paid_to_account_currency = 'SAR'
		doc.paid_from_account_currency = 'SAR'
		doc.source_exchange_rate = 1
		doc.target_exchange_rate = 1
		doc.paid_from = values[0]['paid_from']
		doc.paid_to = values[0]['paid_to']
		doc.received_amount = values[0]['amount']
		doc.amount = self.amount
		doc.downpayment = self.downpayment
		doc.total_amount = self.total_amount
		doc.collected = self.collected + values[0]['amount']
		doc.under_collected = self.under_collected - values[0]['amount']
		doc.collected_no = values[0]['date']
		doc.append("references", {
			'reference_doctype': "Sales Invoice",
			'reference_name': self.contract_invoice,
			'allocated_amount':values[0]['amount']
		})
		doc.save()
		doc.submit()
		frappe.db.commit()
		self.append('installment_payments_history', {
							'installment_name':'تحصيل بتاريخ' ,
							'collected_date': values[0]['date'],
							'collected_amount': values[0]['amount'],
							'orignal_collected_amount': values[0]['amount'] * self.original_installment_percentage /100,
							'profits_collected_amount':values[0]['amount'] * self.profits_installment_percentage1 /100,
							'payment_refrance':str(doc.name)
						})
		self.collected +=values[0]['amount']
		self.under_collected -= values[0]['amount']
		self.original_collected_amount += values[0]['amount'] * self.original_installment_percentage /100
		self.profits_collected_amount += values[0]['amount'] * self.profits_installment_percentage1 /100
		self.collected_no = self.collected *self.total_number_of_installments /self.total_amount
		self.non_collected_no = self.total_number_of_installments - self.collected_no
		if self.under_collected == 0:
			self.contract_status = "مكتمل"
		self.save()

		return str(doc.name)
	


	@frappe.whitelist()
	def create_payment_entry_3(self,values):
		doc = frappe.new_doc('Payment Entry')
		doc.posting_date = values[0]['date']
		doc.company =self.company
		doc.installment_contract = self.installment_contract
		doc.mode_of_payment = values[0]['mode_of_payment']
		doc.item = self.item
		doc.party_type="Customer"
		doc.party =self.customer
		doc.payment_type ="Receive"
		doc.paid_amount = values[0]['amount']
		if 'reference_date' in values[0]:
			doc.reference_date=values[0]['reference_date']
		if 'reference_no' in values[0]:
			doc.reference_no=values[0]['reference_no']
		doc.paid_to_account_currency = 'SAR'
		doc.paid_from_account_currency = 'SAR'
		doc.source_exchange_rate = 1
		doc.target_exchange_rate = 1
		doc.paid_from = values[0]['paid_from']
		doc.paid_to = values[0]['paid_to']
		doc.received_amount = values[0]['amount']
		doc.amount = self.amount
		doc.downpayment = self.downpayment
		doc.total_amount = self.total_amount
		doc.collected = self.collected + values[0]['amount']
		doc.under_collected = self.under_collected - values[0]['amount']
		doc.collected_no =values[0]['date']
		doc.append("references", {
			'reference_doctype': "Sales Invoice",
			'reference_name': self.contract_invoice,
			'allocated_amount':values[0]['amount']
		})
		doc.save()
		doc.submit()
		frappe.db.commit()
		self.append('installment_payments_history', {
							'installment_name':'تحصيل المقدم' ,
							'collected_date': values[0]['date'],
							'collected_amount': values[0]['amount'],
							'orignal_collected_amount': values[0]['amount'],
							'profits_collected_amount':0,
							'payment_refrance':str(doc.name)
						})
		self.collected +=values[0]['amount']
		self.under_collected -= values[0]['amount']
		self.original_collected_amount += values[0]['amount'] 
		self.profits_collected_amount += 0
		self.downcount = 1
		self.total_number_of_installments -=1
		# self.collected_no = self.collected *self.total_number_of_installments /self.total_amount
		# self.non_collected_no = self.total_number_of_installments - self.collected_no
		self.save()

		return str(doc.name)
	

