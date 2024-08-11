// Copyright (c) 2023, ahmedosama.dev@gmail.com and contributors
// For license information, please see license.txt

frappe.ui.form.on('installment Contract', {
	refresh: function(frm) {
		frappe.db.get_value("installments",{"installment_contract": cur_frm.doc.name},"name").then(r=>{
			if(!("name" in r.message))
			{
				if(frm.doc.docstatus==1){
					frm.add_custom_button('إنشاء نظام قسط', () => {
						create_installments(frm)
					})	
				}	
			}
		})

		
	},
	validate: function(frm) {
		calc(frm)
	},
	before_save: function(frm) {
		calc(frm)
	},
	contract_type: function(frm) {
		frm.doc.contract_items = []
		frm.refresh_fields()
		frm.doc.item = ""
		frm.doc.amount = 0
		frm.refresh_fields()
	},
	customer: function(frm) {
		if(frm.doc.customer_id){
			frappe.db.get_value("installment Contract",{"customer_id":["=",frm.doc.customer_id],"docstatus":["!=",2]},"name").then(r=>{
				if("name" in r.message){
					frappe.confirm(__(`العميل اللذى اخترته لديه بالفعل عقد قسط مسجل برقم :<br><strong>${r.message.name}</strong><br>تأكيد ؟`),
					() => {	
					}, 
					() => {
						frm.set_value("customer","")
						frm.set_value("first_sponsor","")
						frm.set_value("first_sponsor_contact","")
						frm.set_value("first_sponsor_id","")
						frm.set_value("second_sponsor","")
						frm.set_value("second_sponsor_contact","")
						frm.set_value("second_sponsor_id","")
						frm.set_value("customer_id","")
						frm.set_value("customer_contact","")
					})							
				}
			})
		}
	},
	item: function(frm) {
		
		if(frm.doc.item){
			frappe.db.get_value("installment Contract",{"item":["=",frm.doc.item],"docstatus":["!=",2]},"name").then(r=>{
				if("name" in r.message){
					frm.set_value("item","")
					frappe.msgprint(__(`الصنف اللذى اخترته لديه بالفعل عقد قسط مسجل برقم :<br><strong>${r.message.name}</strong><br>`))
				}
				else{
					if(frm.doc.item){
						console.log("sassa")
						frappe.db.get_value("Item Price",
						{
							'item_code': frm.doc.item,
							'selling':1,
						},
						['price_list_rate']
						).then(r=>{
							frm.doc.amount = r.message.price_list_rate
							frm.refresh_fields()
						})
					}
					else{
						frm.doc.amount = 0
						frm.refresh_fields()
					}
				}
			})
		}
		
	}
});

function create_installments(frm){
	frappe.model.with_doctype('installments', function() {
	var cust = frappe.model.get_new_doc('installments');
	cust.installment_contract=frm.doc.name
	cust.contract_type = frm.doc.contract_type
	// map child table
	frm.doc.contract_items.forEach(function(row){
		var child = frappe.model.add_child(cust, "installments_items", "installments_items");
		child.item = row.item
		child.price = row.price
	}
	);
	frappe.set_route('Form', 'installments', cust.name);
	});
}


function calc(frm) {
	if(frm.doc.contract_type == "تمويلي"){
		var total = 0
		frm.doc.contract_items.forEach(function(row){
			total += row.price
		});
		frm.set_value("amount" ,total )
	}
	let total_number_of_installments = parseInt((frm.doc.total_amount - frm.doc.downpayment)/frm.doc.installment_budget)
		let number_of_installments = parseInt(total_number_of_installments)
		if(frm.doc.downpayment>0){
			total_number_of_installments +=1
		}
		if ((frm.doc.total_amount - frm.doc.downpayment)/frm.doc.installment_budget > parseInt((frm.doc.total_amount - frm.doc.downpayment)/frm.doc.installment_budget))
		{
		total_number_of_installments +=1
		number_of_installments +=1
		}
		frm.set_value("total_amount" , (frm.doc.amount + ((frm.doc.amount-frm.doc.downpayment)*frm.doc.profits)/100) + frm.doc.discount_and_addition)
		frm.set_value("installment_amount",frm.doc.installment_budget)
		frm.set_value("profits_amount" ,((frm.doc.amount-frm.doc.downpayment)*frm.doc.profits)/100)
		frm.set_value("number_of_installments" ,number_of_installments)
		frm.set_value("total_number_of_installments" , total_number_of_installments)
		frm.set_value("profits_installment_percentage",(frm.doc.profits_amount *100)/(frm.doc.total_amount - frm.doc.downpayment))
		frm.set_value("original_installment_percentage",100 -frm.doc.profits_installment_percentage)
	
}