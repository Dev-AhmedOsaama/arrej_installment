# Copyright (c) 2023, ahmedosama.dev@gmail.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import add_to_date
import datetime
import json


class installments(Document):
	@frappe.whitelist()
	def create_schedule_list(self):
		self.installment_item=[]
		if self.total_number_of_installments > 0:
			installment_idx = 1
			if self.dues_period == 'Monthly':
				if (self.total_amount - self.downpayment)/self.installment_amount != self.total_number_of_installments:
					for index in range(0,self.total_number_of_installments-1):
						if self.downpayment > 0 and index == 0:
							child = self.append('installment_item')
							child.installment_name = "المقدم"
							child.installment_date =self.contract__date
							child.amount =self.downpayment
							child.original_amount = self.downpayment
						else:
							if index ==1:
								child = self.append('installment_item')
								child.installment_name = f"قسط -{installment_idx}"
								installment_idx +=1
								child.installment_date = self.make_first_dues_on
								child.amount =self.installment_amount
								child.original_amount = (self.original_installment_percentage * self.installment_amount)/100
								child.profits_amount = (self.profits_installment_percentage * self.installment_amount)/100
							else:
								child = self.append('installment_item')
								child.installment_name = f"قسط -{installment_idx}"
								installment_idx +=1
								installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
								child.installment_date = add_to_date(installment_date, months=index-1,as_string=True)
								child.amount =self.installment_amount
								child.original_amount = (self.original_installment_percentage * self.installment_amount)/100
								child.profits_amount = (self.profits_installment_percentage * self.installment_amount)/100
					if self.total_amount- self.downpayment - int((self.total_amount - self.downpayment)/self.installment_amount)*self.installment_amount != 0:
						child = self.append('installment_item')
						child.installment_name = f"قسط -{len(self.installment_item)-1}"
						installment_idx +=1
						installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
						child.installment_date = add_to_date(installment_date, months=len(self.installment_item)-2,as_string=True)
						child.amount =self.total_amount- self.downpayment - int((self.total_amount - self.downpayment)/self.installment_amount)*self.installment_amount
						child.original_amount = (self.original_installment_percentage * child.amount)/100
						child.profits_amount = (self.profits_installment_percentage * child.amount)/100
						if self.last_installment >0:
							child = self.append('installment_item')
							child.installment_name = "المؤخر"
							installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
							child.installment_date =add_to_date(installment_date, months=len(self.installment_item)-1,as_string=True)
							child.amount =self.last_installment
					else:
						if self.last_installment >0:
							child = self.append('installment_item')
							child.installment_name = "المؤخر"
							installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
							child.installment_date =add_to_date(installment_date, months=index,as_string=True)
							child.amount =self.last_installment
				else:
					for index in range(0,self.total_number_of_installments):
						if self.downpayment > 0 and index == 0:
							child = self.append('installment_item')
							child.installment_name = "المقدم"
							child.installment_date =self.contract__date
							child.amount =self.downpayment
							child.original_amount = self.downpayment
						elif self.last_installment >0 and index == self.total_number_of_installments-1:
							child = self.append('installment_item')
							child.installment_name = "المؤخر"
							installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
							child.installment_date =add_to_date(installment_date, months=index,as_string=True)
							child.amount =self.last_installment
						else:
							child = self.append('installment_item')
							child.installment_name = f"قسط -{installment_idx}"
							installment_idx +=1
							installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
							child.installment_date = add_to_date(installment_date, months=index,as_string=True)
							child.amount =self.installment_amount
							child.original_amount = (self.original_installment_percentage * self.installment_amount)/100
							child.profits_amount = (self.profits_installment_percentage * self.installment_amount)/100
			else:
				if (self.total_amount - self.downpayment)/self.installment_amount != self.total_number_of_installments:
					for index in range(0,self.total_number_of_installments-1):
						if self.downpayment > 0 and index == 0:
							child = self.append('installment_item')
							child.installment_name = "المقدم"
							child.installment_date =self.contract__date
							child.amount =self.downpayment
							child.original_amount = self.downpayment
						else:
							if index ==1:
								child = self.append('installment_item')
								child.installment_name = f"قسط -{installment_idx}"
								installment_idx +=1
								child.installment_date = self.make_first_dues_on
								child.amount =self.installment_amount
								child.original_amount = (self.original_installment_percentage * self.installment_amount)/100
								child.profits_amount = (self.profits_installment_percentage * self.installment_amount)/100
							else:
								child = self.append('installment_item')
								child.installment_name = f"قسط -{installment_idx}"
								installment_idx +=1
								installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
								child.installment_date = add_to_date(installment_date, years=index-1,as_string=True)
								child.amount =self.installment_amount
								child.original_amount = (self.original_installment_percentage * self.installment_amount)/100
								child.profits_amount = (self.profits_installment_percentage * self.installment_amount)/100
					if self.total_amount- self.downpayment - int((self.total_amount - self.downpayment)/self.installment_amount)*self.installment_amount != 0:
						child = self.append('installment_item')
						child.installment_name = f"قسط -{len(self.installment_item)-1}"
						installment_idx +=1
						installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
						child.installment_date = add_to_date(installment_date, months=len(self.installment_item)-2,as_string=True)
						child.amount =self.total_amount- self.downpayment - int((self.total_amount - self.downpayment)/self.installment_amount)*self.installment_amount
						child.original_amount = (self.original_installment_percentage * child.amount)/100
						child.profits_amount = (self.profits_installment_percentage * child.amount)/100
						if self.last_installment >0:
							child = self.append('installment_item')
							child.installment_name = "المؤخر"
							installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
							child.installment_date =add_to_date(installment_date, months=len(self.installment_item)-1,as_string=True)
							child.amount =self.last_installment
					else:
						if self.last_installment >0:
							child = self.append('installment_item')
							child.installment_name = "المؤخر"
							installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
							child.installment_date =add_to_date(installment_date, months=index,as_string=True)
							child.amount =self.last_installment
				else:
					for index in range(0,self.total_number_of_installments):
						if self.downpayment > 0 and index == 0:
							child = self.append('installment_item')
							child.installment_name = "المقدم"
							child.installment_date =self.make_first_dues_on
							child.amount =self.downpayment
							child.original_amount = self.downpayment
						elif self.last_installment >0 and index == self.total_number_of_installments-1:
							child = self.append('installment_item')
							child.installment_name = "المؤخر"
							installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
							child.installment_date =add_to_date(installment_date, years=index,as_string=True)
							child.amount =self.last_installment
							
						else:
							child = self.append('installment_item')
							child.installment_name = f"قسط -{installment_idx}"
							installment_idx +=1
							installment_date =datetime.datetime.strptime(self.make_first_dues_on,'%Y-%m-%d')
							child.installment_date = add_to_date(installment_date, years=index,as_string=True)
							child.amount =self.installment_amount
							child.original_amount = (self.original_installment_percentage * self.installment_amount)/100
							child.profits_amount = (self.profits_installment_percentage * self.installment_amount)/100
		self.save()


		
