// Copyright (c) 2023, ahmedosama.dev@gmail.com and contributors
// For license information, please see license.txt

frappe.ui.form.on('installments', {

	refresh: function(frm) {
		// if(frm.doc.docstatus==0 && !frm.is_new()){
		// 	frm.call("create_schedule_list")
		// }
		if(frm.doc.docstatus==0 && frm.is_new() && frm.doc.installment_contract){
			frm.save()
			cur_frm.reload_doc()
			
		}
		if(frm.doc.docstatus==0 && !frm.is_new() && frm.doc.installment_item.length==0){
			frm.call("create_schedule_list")
			cur_frm.reload_doc()
			
		}
		if(frm.doc.docstatus==0 && !frm.is_new()){
			frm.add_custom_button('حساب الاقساط', () => {
				frm.call("create_schedule_list")
			
			})
		}
		frappe.db.get_value("installment Payments",{"installments": cur_frm.doc.name},"name").then(r=>{
			if(!("name" in r.message))
			{
				if(frm.doc.docstatus==1){
					frm.add_custom_button('تأكيد اتمام العقد', () => {
						create_installment_payments(frm)	
					})
				}
			}
			// if(!("name" in r.message))
			// {
			// 	if(frm.doc.docstatus==1){
			// 		frm.add_custom_button('تأكيد اتمام العقد (مقسط)', () => {
			// 			create_installment_payments(frm)	
			// 		})
			// 	}
			// }
			
		})
		
		

	},
	installment_contract:function(frm) {
		frm.doc.installment_item = []
		frm.refresh_fields()
	},
	// before_save:function(frm) {
	// 	if(frm.doc.installment_item.length>0){
	// 		var grand_amount = 0
	// 		frm.doc.installment_item.forEach(item => {
	// 			grand_amount+=item.amount				
	// 		});
	// 		if(grand_amount!=frm.doc.total_amount){
	// 			frappe.throw('برجاء التأكد من ان جميع قيم الاقساط تساوي قيمه العقد !')
	// 		}
	// 	}
	// },
});

function create_installment_payments(frm){
	frappe.model.with_doctype('installment Payments', function() {
	var cust = frappe.model.get_new_doc('installment Payments');
	cust.installment_contract=frm.doc.installment_contract
	cust.total_amount = frm.doc.total_amount
	cust.amount = frm.doc.total_amount - frm.doc.downpayment
	cust.under_collected= frm.doc.total_amount
	cust.installments =frm.doc.name
	cust.instalment_hide = 1
	var original_amount = 0
	var profits_amount = 0
	cust.contract_type = frm.doc.contract_type
	frm.doc.installments_items.forEach(item => {
		var childTable = frappe.model.add_child(cust,'installment_payments_items','installment_payments_items');
		childTable.item = item.item
		childTable.price = item.price
	});
	if(frm.doc.installment_item.length>0){
		frm.doc.installment_item.forEach(item => {
			var childTable = frappe.model.add_child(cust,'payment_installments');
			childTable.installment_name= item.installment_name
			childTable.installment_date = item.installment_date
			childTable.amount = item.amount
			childTable.original_amount = item.original_amount
			childTable.profits_amount = item.profits_amount
			childTable.payment_status = "Unpaid"
			original_amount += item.original_amount
			profits_amount += item.profits_amount
		});
		cust.original_amount =original_amount
		cust.profits_amount =profits_amount
	}
	frappe.set_route('Form', 'installment Payments', cust.name);
});
}


function create_installment_payments2(frm){
	frappe.model.with_doctype('installment Payments', function() {
	var cust = frappe.model.get_new_doc('installment Payments');
	cust.installment_contract=frm.doc.installment_contract
	cust.total_amount = frm.doc.total_amount
	cust.amount = frm.doc.total_amount - frm.doc.downpayment
	cust.under_collected= frm.doc.total_amount
	cust.installments =frm.doc.name
	cust.instalment_hide = 0
	var original_amount = 0
	var profits_amount = 0
	if(frm.doc.installment_item.length>0){
		frm.doc.installment_item.forEach(item => {
			var childTable = frappe.model.add_child(cust,'payment_installments');
			childTable.installment_name= item.installment_name
			childTable.installment_date = item.installment_date
			childTable.amount = item.amount
			childTable.original_amount = item.original_amount
			childTable.profits_amount = item.profits_amount
			childTable.payment_status = "Unpaid"
			original_amount += item.original_amount
			profits_amount += item.profits_amount
		});
		cust.original_amount =original_amount
		cust.profits_amount =profits_amount
	}
	frappe.set_route('Form', 'installment Payments', cust.name);
});
}
