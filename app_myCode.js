/* 
My own JS code Jan 16, 2020 ~

1. UI Controller
- get input data (event)
- add item to the list

2. Budget Controller
- save input data
- data structure (all items, budget, type)

3. App Controller
- call public functions of UI controller and Budget controller


*/


var UIController = (function(){

	var DOMstrings = {
		inputContainer: '.add__container',
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incContainer: '.income__list',
		expContainer: '.expenses__list',
		budgetValue: '.budget__value',
		totalIncome: '.budget__income--value',
		totalExpense: '.budget__expenses--value',
		expPercentage: '.budget__expenses--percentage',
		itemValue: '.item__value',
		itemPerc: '.item__percentage',
		itemDelBtn: '.ion-ios-close-outline',
		container: '.container',
		budgetDate: ".budget__title--month"
	}


	var formatNum = function(type, num){
		var newNum, int, dec;
		//decimal numbers
		
		num = Math.abs(num).toFixed(2);

		//',' every thousands
		num = num.toString();
		newNum = num.split('.');
		int = newNum[0];
		dec = newNum[1];

		if (int.length > 3 && int.length < 7 ){
			//소숫자리 나누기
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
		} else if (int.length >= 7) {
			int = int.substr(0, int.length - 5) + ',' + int.substr(int.length - 5, 3)
			+ ',' + int.substr(int.length - 3, 3);
		}

		num = int + '.' + dec;

		//income: '+', expense: '-' 
		if (type === 'inc') {
			num = '+ ' + num;
		} else if (type === 'exp') {
			num = '- ' + num;
		}

		return num;
	}

	var resetInput= function(){
			//delete contents in the input box
			document.querySelector(DOMstrings.inputDesc).value = '';
			document.querySelector(DOMstrings.inputValue).value = '';

			//focus on the description input box
			document.querySelector(DOMstrings.inputDesc).focus();
	}

	return {
		getInput: function(){
			var type, desc, val;

			return {
				type: document.querySelector(DOMstrings.inputType).value,
				desc: document.querySelector(DOMstrings.inputDesc).value,
				val: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			}

		},

		getDOMstrings:function(){
			return DOMstrings;
		},

		showMonth: function(){
			var months, today;
			
			months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			
			today = new Date();

			document.querySelector(DOMstrings.budgetDate).textContent = months[today.getMonth()] + ' ' + today.getFullYear();

		},

		addItem: function(type, obj){
			var element, html, percentage;

			html =  '<div class="item clearfix" id="' + type + '-' + obj.id 
					+ '"><div class="item__description">' + obj.desc 
					+ '</div><div class="right clearfix"><div class="item__value">' + formatNum(type, obj.val) 
					+ '</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

			if (type === 'inc') {
				document.querySelector(DOMstrings.incContainer).insertAdjacentHTML('beforeend', html);
			} else if (type === 'exp'){
				percentage = '<div class="item__percentage">' + obj.perc+ '</div>';
				document.querySelector(DOMstrings.expContainer).insertAdjacentHTML('beforeend', html);
				document.getElementById('exp-' + obj.id).querySelector(DOMstrings.itemValue).insertAdjacentHTML('afterend', percentage);
			}

			resetInput();
			
		},

		deleteItem:function(id) {
			document.getElementById(id).remove();
		},

		updateBudget: function(budget) {

			if(budget.totalIncome >= budget.totalExpense) {
				document.querySelector(DOMstrings.budgetValue).textContent = formatNum('inc', budget.budgetValue);
			} else {
				document.querySelector(DOMstrings.budgetValue).textContent = formatNum('exp', budget.budgetValue);
			}
			
			document.querySelector(DOMstrings.totalIncome).textContent = formatNum('inc' , budget.totalIncome);
			document.querySelector(DOMstrings.totalExpense).textContent = formatNum('exp', budget.totalExpense);
			document.querySelector(DOMstrings.expPercentage).textContent = budget.expPencentage + '%';

		},

		updateExpPerc: function(pers){
			var orgPers = document.querySelectorAll(DOMstrings.itemPerc);
			
			for (var i = 0; i < orgPers.length; i++) {
				orgPers[i].textContent = pers[i];

			}

		},

		changeBorder: function () {
			var inputs; 

			inputs = document.querySelector(DOMstrings.inputContainer).children;
			
			for (var i = 0; i < inputs.length; i++){
				inputs[i].classList.toggle('red-focus');
			}

		},

		resetBudget: function(){
			document.querySelector(DOMstrings.budgetValue).textContent = '0.00';
			document.querySelector(DOMstrings.totalIncome).textContent = '+ 0.00';
			document.querySelector(DOMstrings.totalExpense).textContent = '- 0.00';
			document.querySelector(DOMstrings.expPercentage).textContent = '---';
	}

	}


})();

var BudgetContoller = (function(){
	var allItems, exp, inc;

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		total: {
			exp: 0,
			inc: 0
		}
	}

	var Expense = function(id, desc, val){
		this.id = id;
		this.desc = desc;
		this.val = val;
	}

	Expense.prototype.calcPerc = function(){
		var perc;
		if (data.total.inc > 0 ){
			perc = Math.floor((this.val / data.total.inc) * 100);
			this.perc = perc + '%';
		} else {
			this.perc = '---';
		}
		
	}

	var Income = function(id, desc, val){
		this.id = id;
		this.desc = desc;
		this.val = val;
	}

	//total sum of expenses/incomes
	var	calculateTotal = function(type){
		var sum = 0;

		for (var i = 0; i < data.allItems[type].length; i++) {
			sum = sum + data.allItems[type][i].val;
		}
		data.total[type] = sum;
			
	}
	
	return {
		addData: function(obj){
			var id, newItem;	

			//Assigning an ID to the new item
			if (data.allItems[obj.type].length > 0) {
				//ID of the last element of Inc/Exp array + 1
				id = data.allItems[obj.type][data.allItems[obj.type].length - 1].id + 1;
			} else {
				id = 0;
			}

			//Creating a new object
			if(obj.type === 'inc'){
				newItem = new Income(id, obj.desc, obj.val);
				
			} else if (obj.type === 'exp'){
				newItem = new Expense(id, obj.desc, obj.val);
				newItem.calcPerc();
			}

			//Adding to the data
			data.allItems[obj.type].push(newItem);

			//Updating total
			calculateTotal(obj.type);

			return newItem;
		},

		showData: function(){
			console.log(data);
		},

		deleteData: function(itemId){
			var toBeDeleted, type, id;
			toBeDeleted = itemId.split('-');
			type = toBeDeleted[0];
			id = parseFloat(toBeDeleted[1]);

			
			data.allItems[type].forEach(function(cur, i){
				
				if (cur.id === id) {
					//delete one item from the position of index
					data.allItems[type].splice(i, 1);

					//Updating total
					calculateTotal(type);

				}
			})	

		},

		getBudget: function(){
			var perc;

			if (data.total.inc > 0){
				perc = Math.round((data.total.exp / data.total.inc) * 100);
			} else {
				perc = '---';
			}

			return {
				budgetValue: data.total.inc - data.total.exp,
				totalExpense: data.total.exp,
				totalIncome: data.total.inc,
				expPencentage: perc
			};
		},

		updateExpPerc: function(){
			var updatedPers = [];

			data.allItems['exp'].forEach(function(cur, i){
				cur.calcPerc();
				updatedPers.push(cur.perc);
			})
		return updatedPers;
	}
	}
})();

var AppContoller = (function(UICtrl, BudgetCtrl){
	var DOM = UICtrl.getDOMstrings();

	var eventListner = function(){
		//인풋 버튼 클릭 이벤트
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		//엔터 이벤트
		document.addEventListener('keypress', function(e){
			if (e.keyCode === 13 || e.which === 13){
				ctrlAddItem();
			}
		});

		//아이템 삭제 이벤트
		document.querySelector(DOM.container).addEventListener('click', itemDelete); 

		//input type change
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeBorder);
	}

	var ctrlAddItem = function(){
		var newItem, input,budget;

		input = UICtrl.getInput();

		if(input.desc.length !== 0 && !isNaN(input.val)){
			//data에 저장
			newItem = BudgetCtrl.addData(input);
			//UI 리스트에 추가 
			UICtrl.addItem(input.type, newItem);
			//calculate budget
			budget = BudgetCtrl.getBudget();

			UICtrl.updateBudget(budget);

			if (input.type === 'inc') {
				updatePercentages();
			}
		}
	}

	var updatePercentages = function(){

		//returns an array of expense percentages
		var updatedPercentages = BudgetCtrl.updateExpPerc();

		UICtrl.updateExpPerc(updatedPercentages);
	}	
	
	var itemDelete = function(e){
		var id;
		if (e.target.matches(DOM.itemDelBtn)){
			id = e.target.closest('.item').id;
			

			//delete the item from data 
			BudgetCtrl.deleteData(id);
			//delete the item from UI
			UICtrl.deleteItem(id);
			//update the budget
			UICtrl.updateBudget(BudgetCtrl.getBudget());


			//if an income gets deleted, update percentages of expenses
			if (id.includes('inc')) {
				UICtrl.updateExpPerc(BudgetCtrl.updateExpPerc());
			}
		}
		
	}

	return {
		init: function(){
			console.log("App has started");
			UICtrl.showMonth();
			UICtrl.resetBudget();
			eventListner(); //이벤트가 모여있는 함수를 등록시켜주고 앱을 초기세팅해주는 함수 
		}

	}
})(UIController, BudgetContoller);

AppContoller.init();