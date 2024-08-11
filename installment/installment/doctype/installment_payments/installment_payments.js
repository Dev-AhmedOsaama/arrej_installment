// Copyright (c) 2023, ahmedosama.dev@gmail.com and contributors
// For license information, please see license.txt

frappe.ui.form.on('installment Payments', {
	refresh: function(frm) {
		if(frm.is_new() && frm.doc.installment_contract && frm.doc.installments){
		// 	frm.set_value("amount",frm.doc.total_amount - frm.doc.downpayment)
		// 	frm.set_value("collected",0)
		// 	frm.set_value("under_collected",frm.doc.amount)
			frm.save('Submit');
		}
		frm.fields_dict.payment_installments.grid.grid_buttons.addClass('hidden');
		frm.set_df_property('payment_installments', 'cannot_delete_rows', 1);
		frm.set_df_property('payment_installments', 'cannot_add_rows', 1);


		frm.fields_dict.installment_payments_history.grid.grid_buttons.addClass('hidden');
		frm.set_df_property('installment_payments_history', 'cannot_delete_rows', 1);
		frm.set_df_property('installment_payments_history', 'cannot_add_rows', 1);
		frm.set_df_property('installment_payments_history', 'cannot_edit_rows', 1);

		// if(frm.doc.docstatus==1 && !frm.is_new() && frm.doc.downcount==1 && frm.doc.contract_status != "مكتمل"){
		// 	frm.add_custom_button("تحصيل الدفعات", () => {
		// 		dialog_amount(frm);
			
		// 	})
		// }
		// if(frm.doc.docstatus==1 && !frm.is_new() && frm.doc.downcount==0){
		// 	frm.add_custom_button("تحصيل المقدم", () => {
		// 		dialog_downpayment(frm)
		// 	})
		// }
	},
	// validate: function(frm) {
	// 	frm.set_value("amount",frm.doc.total_amount - frm.doc.downpayment)
	// 	var colleted = 0
	// 	var under_collected = 0
	// 	frm.doc.payment_installments.forEach(item => {
	// 		if(item.payment_status == "Paid"){
	// 			colleted += item.amount
	// 		}
	// 		else{
	// 			under_collected += item.amount
	// 		}
	// 	});
	// 	frm.set_value("collected",colleted)
	// 	frm.set_value("under_collected",under_collected)
	// },
});


frappe.ui.form.on('payment Installments', {
	collect: function (frm, cdt, cdn) {
		let row = frappe.get_doc(cdt, cdn)
		if(row.payment_status=="Unpaid"){
			if(row.installment_date > frappe.datetime.nowdate()){
				frappe.confirm('هل تريد تحصيل هذا القسط حيث ان تاريخة ف المستقبل ؟',
				() => {
				dialog(frm,row)
				// frm.call('create_payment_entry',row).then(r=>{
				// 	frm.reload_doc()
				// 	print(r.message)	
				// })
				}, () => {
				})		
			}
			else{
				dialog(frm,row)
				// frm.call('create_payment_entry',row).then(r=>{
				// 	frm.reload_doc()
				// 	print(r)	
				// 	print(r.message)
				// })
			}
		}
		else{
			
			frappe.msgprint("انت بالفعل حصلت هذا القسط!")
		}
		
		
	},
	collected_amount: function (frm, cdt, cdn) {
		let row = frappe.get_doc(cdt, cdn)	
		if(row.idx != frm.doc.payment_installments.length){
			let total_collected_amount = row.collected_amount + row.total_collected_amount - row.amount
			frm.doc.payment_installments[row.idx].total_collected_amount = total_collected_amount
			frm.refresh_fields()
			frm.save('Update')
		}
		else{
			row.collected_amount = 0 
			frm.refresh_fields()
			frm.save('Update')
		}
		
	},
});



function print(invoice_name) {
	const url =
	  frappe.urllib.get_base_url() +
	  '/printview?doctype=Payment%20Entry&name=' +
	  invoice_name +
	  '&trigger_print=1' +
	  '&format=' +
	  'MZJ-PE' +
	  '&no_letterhead=' +
	  'No&_lang=ar';
	const printWindow = window.open(url, 'Print');
	printWindow.addEventListener(
	  'load',
	  function () {
		printWindow.print();
		// printWindow.close();
		// NOTE : uncomoent this to auto closing printing window
	  },
	  true
	);
}



function dialog(frm,row){
	let dialog = new frappe.ui.Dialog({
		title: 'تحصيل :'+row.installment_name,
		fields: [
			
			{
				label: '',
				fieldname: 'section_break_6',
				fieldtype: 'Section Break'
			},
			{
				label: __('Date'),
				fieldname: 'date',
				fieldtype: 'Date',
				reqd:1
			},
			{
				label: 'قيمة القسط',
				fieldname: 'installment_amount',
				fieldtype: 'Currency',
				read_only:1
			},
			{
				label: '',
				fieldname: 'column_break',
				fieldtype: 'Column Break'
			},
			{
				label: 'القيمه المحصلة من القسط',
				fieldname: 'total_collected_amount',
				fieldtype: 'Currency',
				read_only:1
			},
			{
				label: '',
				fieldname: 'column_break',
				fieldtype: 'Column Break'
			},
			{
				label: 'المتبقي',
				fieldname: 'remaining',
				fieldtype: 'Currency',
				read_only:1
			},
			{
				label: '',
				fieldname: 'section_break_60',
				fieldtype: 'Section Break'
			},
			{
				label: __('Mode of Payment'),
				fieldname: 'mode_of_payment',
				fieldtype: 'Link',
				options:'Mode of Payment',
				reqd:1,
				default:'نقدي'
			},
			{
				label: __('Cheque/Reference No'),
				fieldname: 'reference_no',
				fieldtype: 'Data',
				mandatory_depends_on:"eval:doc.mode_of_payment == 'تحويل من بنك 41' || doc.mode_of_payment == 'تحويل من بنك 42'",
				depends_on:"eval:doc.mode_of_payment == 'تحويل من بنك 41' || doc.mode_of_payment == 'تحويل من بنك 42'",
			},
			{
				label: __('Cheque/Reference Date'),
				fieldname: 'reference_date',
				fieldtype: 'Date',
				mandatory_depends_on:"eval:doc.mode_of_payment == 'تحويل من بنك 41' || doc.mode_of_payment == 'تحويل من بنك 42'",
				depends_on:"eval:doc.mode_of_payment == 'تحويل من بنك 41' || doc.mode_of_payment == 'تحويل من بنك 42'",

			},
			
			{
				label: '',
				fieldname: 'section_break_7',
				fieldtype: 'Section Break'
			},
			{
				label: 'قيمه التحصيل',
				fieldname: 'amount',
				fieldtype: 'Currency'
			}
		],
		size: 'large', // small, large, extra-large 
		primary_action_label: 'Submit',
		primary_action(values) {
			console.log(values);
			if(values.amount>0 && values.amount<=values.remaining){
				frm.call('create_payment_entry',[row,values]).then(r=>{
					frm.reload_doc()
					print(r.message)	
				})
			dialog.hide();
			}
			else{
				frappe.msgprint("يرجي ادخال قيمه التحصيل بحيث تكون اكبر من الصفر واقل من قيمه المتبقي !")
			}
			
		}

	});
	
	dialog.set_value("installment_amount",row.amount);
	dialog.set_value("total_collected_amount",row.total_collected_amount);
	dialog.set_value("remaining",row.amount-row.total_collected_amount);
	dialog.set_value("date",row.installment_date);
	dialog.show();
}




function dialog_amount(frm){
	let dialog = new frappe.ui.Dialog({
		title: 'تحصيل :',
		fields: [
			{
				label: __('Date'),
				fieldname: 'date',
				fieldtype: 'Date',
				reqd:1,
			},
			{
				label: __('Mode of Payment'),
				fieldname: 'mode_of_payment',
				fieldtype: 'Link',
				options:'Mode of Payment',
				reqd:1,
				default:'نقدي'
			},
			{
				label: __('Cheque/Reference No'),
				fieldname: 'reference_no',
				fieldtype: 'Data',
				mandatory_depends_on:"eval:doc.mode_of_payment != 'نقدي'",
				depends_on:"eval:doc.mode_of_payment != 'نقدي'",
			},
			{
				label: __('Cheque/Reference Date'),
				fieldname: 'reference_date',
				fieldtype: 'Date',
				mandatory_depends_on:"eval:doc.mode_of_payment != 'نقدي'",
				depends_on:"eval:doc.mode_of_payment != 'نقدي'",

			},
			{
				fieldname: 'column_break_18',
				fieldtype: 'Column Break',
			},
			{
				label: __('Account Paid From'),
				fieldname: 'paid_from',
				fieldtype: 'Link',
				options:'Account',
				reqd:1
			},
			{
				label: __('Account Paid To'),
				fieldname: 'paid_to',
				fieldtype: 'Link',
				options:'Account',
				reqd:1
			},
			{
				label: 'قيمه التحصيل',
				fieldname: 'amount',
				fieldtype: 'Currency',
				reqd:1
			},
			
		],
		size: 'extra-large', // small, large, extra-large 
		primary_action_label: 'Submit',
		primary_action(values) {
			if(values.amount<=frm.doc.under_collected){
				frm.call('create_payment_entry_2',[values]).then(r=>{
					frm.reload_doc()
					print(r.message)	
				})
				dialog.hide();
			}
			else{
				frappe.msgprint("يرجي ادخال قيمه التحصيل بحيث لا تتخطي قيمه المتبقي !")
			}
			}
			

	});
	dialog.show();
}

function dialog_downpayment(frm){
	let dialog = new frappe.ui.Dialog({
		title: 'تحصيل :',
		fields: [
			{
				label: __('Date'),
				fieldname: 'date',
				fieldtype: 'Date',
				reqd:1,
			},
			{
				label: __('Mode of Payment'),
				fieldname: 'mode_of_payment',
				fieldtype: 'Link',
				options:'Mode of Payment',
				reqd:1,
				default:'نقدي'
			},
			{
				label: __('Cheque/Reference No'),
				fieldname: 'reference_no',
				fieldtype: 'Data',
				mandatory_depends_on:"eval:doc.mode_of_payment == 'تحويل من بنك 41' || doc.mode_of_payment == 'تحويل من بنك 42'",
				depends_on:"eval:doc.mode_of_payment == 'تحويل من بنك 41' || doc.mode_of_payment == 'تحويل من بنك 42'",
			},
			{
				label: __('Cheque/Reference Date'),
				fieldname: 'reference_date',
				fieldtype: 'Date',
				mandatory_depends_on:"eval:doc.mode_of_payment == 'تحويل من بنك 41' || doc.mode_of_payment == 'تحويل من بنك 42'",
				depends_on:"eval:doc.mode_of_payment == 'تحويل من بنك 41' || doc.mode_of_payment == 'تحويل من بنك 42'",

			},
			{
				fieldname: 'column_break_18',
				fieldtype: 'Column Break',
			},
			{
				label: __('Account Paid From'),
				fieldname: 'paid_from',
				fieldtype: 'Link',
				options:'Account',
				reqd:1,
				get_query: function() {
					return {
						filters: {
							'account_type': 'Receivable'
						}
					}
				}
			},
			{
				label: __('Account Paid To'),
				fieldname: 'paid_to',
				fieldtype: 'Link',
				options:'Account',
				reqd:1
			},
			{
				label: 'قيمه التحصيل',
				fieldname: 'amount',
				fieldtype: 'Currency',
				reqd:1,
				read_only:1
			},
			
		],
		size: 'extra-large', // small, large, extra-large 
		primary_action_label: 'Submit',
		primary_action(values) {
			console.log(values)
			frm.call('create_payment_entry_3',[values]).then(r=>{
				frm.reload_doc()
				print(r.message)	
			})
			dialog.hide();
			}
			

	});
	dialog.set_value('amount',frm.doc.downpayment)
	dialog.show();
}