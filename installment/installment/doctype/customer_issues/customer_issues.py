# Copyright (c) 2023, ahmedosama.dev@gmail.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class CustomerIssues(Document):
	def on_submit(self):
		doc = frappe.new_doc('Sales Invoice')
		doc.customer =self.customer
		doc.other_services1 = self.other_services
		doc.issue=self.issue
		doc.append("items", {
			'item_code': self.item,
			'qty': 1,
			'rate':self.amount
		})

		doc.save()
		doc.submit()
		frappe.db.commit()
		self.contract_invoice = doc.name
		self.save()