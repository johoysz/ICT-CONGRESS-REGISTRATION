		//using es5 javascript
var app = angular.module("myapp",["ngRoute"]);
			app.config(function($routeProvider){
				$routeProvider.when("/",{
					templateUrl:"login.html",
					controller:"loginctrl"
				});
				$routeProvider.when("/main",{
					templateUrl:"main.html",
					controller:"mainctrl",
					resolve:{
						'check':function($location,$rootScope){
							if(!$rootScope.logged){
								$location.path("/")
								$rootScope.message="Logged Properly";
							}
						}
					}
				});
				$routeProvider.when("/userMain",{
					templateUrl:"userMain.html",
					controller:"usermainctrl",
					resolve:{
						'check':function($location,$rootScope){
							if(!$rootScope.logged){
								$location.path("/")
								$rootScope.message="Logged Properly";
							}
						}
					}
				});

			});
			
			//service
			app.service('sharedService', function() {
				var sharedData = {};
			
				return {
					getSharedData: function() {
						return sharedData;
					},
					setSharedData: function(data) {
						sharedData = data;
					}
				};
			});
			app.service('userService', function() {
				var userData = {};
			
				// Setter method to set user data
				this.setUserData = function(username, password) {
					userData.username = username;
					userData.password = password;
				};
			
				// Getter method to get user data
				this.getUserData = function() {
					return userData;
				};
			});

			app.controller("loginctrl",function($scope,$rootScope,$location,$http,userService,sharedService){
				$scope.list = [];
				$scope.list = JSON.parse(localStorage.getItem("studentlist"));
				if($scope.list==null){
					$scope.list=[];
				}

				$scope.login = function(){
					var username = $scope.username;
					var password = $scope.password;
					var users = JSON.stringify($scope.list);
					$http({
						'method':'post',
						'url':'userlogin',
						'data':{
							'username':username,
							'password':password,
							'users': users,
						}
						
					}).then(function(response){
						$scope.user = response.data;
						if($scope.user.length>0){ //if logged in credentials are not for admin
							if($scope.user[0].username != "admin" && $scope.user[0].password != "user"){
								$location.path("/userMain");
								$rootScope.logged=true;
								let loggedUser = $scope.user[0].username;
								sharedService.setSharedData(loggedUser);
							}
							else{
								$location.path("/main");
								$rootScope.logged=true;
								userService.setUserData(username, password);
							}

						}
						else
							$rootScope.message = "Invalid User";
					});
				}

				$scope.list = [];
				$scope.list = JSON.parse(localStorage.getItem("studentlist"));
				if($scope.list==null){
					$scope.list=[];
				}
			
				$scope.saveReg = function(){
					var student = {
						'idno':$scope.idno,
						'rfid':generateRFID(8),
						'pass':$scope.pass,
						'lastname':$scope.lastname,
						'firstname':$scope.firstname,
						'course':$scope.course,
						'level':$scope.level,
						'size':$scope.size,
						'amt':0,
						'insurance':false,
						'consent':false,
						'claimed':false,
						'attendance':false
					}
					var studentIndex = -1;

					// check ang idno sa list 
					for (var i = 0; i < $scope.list.length; i++) {
						if ($scope.list[i].idno === $scope.idno) {
							studentIndex = i;
							break;
						}
					}
					
					if (($scope.idno == null) ||($scope.pass == null)||($scope.lastname == null) || ($scope.firstname == null) ||($scope.course == null)||($scope.level == null)||($scope.size == null)){
						alert ("Please Fill In All Required Fields");
					} else {
						if (studentIndex === -1) {
							$scope.list.push(student);
							localStorage.setItem("studentlist",JSON.stringify($scope.list));
							alert("New Student Added");
							document.getElementById('idno').value="";
							document.getElementById('pass').value="";
							document.getElementById('lastname').value="";
							document.getElementById('firstname').value="";
							document.getElementById('course').value="";
							document.getElementById('size').value="";
							document.getElementById('level').value="";
							document.getElementById('idno').focus();
						} else {
							alert("Student ID already exist! Please check your ID number again.")
						}
					}
				}

				//generate rfid
				function generateRFID(length) {
					const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Define the characters to use
					let rfid = '';
				
					for (let i = 0; i < length; i++) {
						const randomIndex = Math.floor(Math.random() * characters.length);
						rfid += characters.charAt(randomIndex);
					}
				
					return rfid;
				}
				

				//forgot password
				$scope.savePass = function() {
					var studentIndex = -1;

					// check ang idno sa list
					for (var i = 0; i < $scope.list.length; i++) {
						if ($scope.list[i].idno === $scope.username) {
							studentIndex = i;
							break;
						}
					}

					if (studentIndex !== -1) {
						$scope.list[studentIndex].pass = $scope.newPassword;

						// Save ang updated list to local storage
						localStorage.setItem("studentlist", JSON.stringify($scope.list));
						
						alert("Updated New Password");

						// Close edit modal 
						document.getElementById('forgotPassModal').style.display = "none";
					} 
				}
				
			});
///			USER MAIN CONTROLLER
			app.controller("usermainctrl",function($scope,$http,$location,$rootScope, sharedService){
				$scope.list = [];
				$scope.list = JSON.parse(localStorage.getItem("studentlist"));
				if($scope.list==null){
					$scope.list=[];
				}
				$scope.userInfo = $scope.list.filter(el=>el.idno == sharedService.getSharedData());
				

				$scope.logout = function(){
					$rootScope.logged=false;
					$rootScope.message="";
					$rootScope.loggedUser="";
					$location.path("/");
				}
			});
///
			app.controller("mainctrl",function($scope,$http,$location,$rootScope,userService,sharedService){
				// kuha data gikan userService
				var userData = userService.getUserData();

				// Assign username and password to scope variables
				$scope.username = userData.username;
				$scope.password = userData.password;
				$scope.pagesizes = [5,10,15,20];
				
				$scope.pageSize = 5;
				$scope.currentPage = 0;
				
				$scope.header = ['#','idno','rfid','lastname','firstname','course','level','amount'];				
				$scope.header1 = ['#','idno','rfid','lastname','firstname','course','level','action'];
				$scope.header2 = ['#','idno','size','amount','insurance','claimed','consent','attended','action'];
				$scope.header3 = ['#','idno','rfid','lastname','firstname','course','level'];
				
				$scope.editModal = function(idno,rfid,firstname,lastname,course,level) {
					var openModal = document.getElementById('openModal');
					openModal.style.display = "block";
					document.getElementById('idnoToShow').value = idno;
					document.getElementById('rfidToShow').value = rfid;
					document.getElementById('firstnameToShow').value = firstname;
					document.getElementById('lastnameToShow').value = lastname;
					document.getElementById('courseToShow').value = course;
					document.getElementById('levelToShow').value = level;
					
					$scope.idnoToShow = idno;
					$scope.rfidToShow = rfid;
					$scope.firstnameToShow = firstname;
					$scope.lastnameToShow = lastname;	
					$scope.courseToShow = course;
					$scope.levelToShow = level;
				};

				//edit order modal
				$scope.editOrderModal = function(idno,amount,size,insurance,claimed,consent,attendance) {
					var openOrderModal = document.getElementById('openOrderModal');
					openOrderModal.style.display = "block";
					document.getElementById('idnoToShow').value = idno;
					document.getElementById('amountToShow').value = amount;
					document.getElementById('sizeToShow').value = size;
					document.getElementById('insuranceToShow').value = insurance;
					document.getElementById('claimedToShow').value = claimed;
					document.getElementById('consentToShow').value = consent;
					document.getElementById('attendanceToShow').value = attendance;
					
					$scope.idnoToShow = idno;
					$scope.amount = amount;
					$scope.sizeToShow = size;	
					$scope.insuranceToShow = insurance;
					$scope.claimedToShow = claimed;
					$scope.consentToShow = consent;
					$scope.attendanceToShow = attendance;
				};
				
				$scope.saveEditOrder = function() {
					var studentIndex = -1;

					// check ang idno sa list para kbaw asa ang e update base sa idno sa gi edit
					for (var i = 0; i < $scope.list.length; i++) {
						if ($scope.list[i].idno === $scope.idnoToShow) {
							studentIndex = i;
							break;
						}
					}

					if (studentIndex !== -1) {
						$scope.list[studentIndex].amount = $scope.amountToShow;
						$scope.list[studentIndex].size = $scope.sizeToShow;
						$scope.list[studentIndex].insurance = $scope.insuranceToShow;
						$scope.list[studentIndex].claimed = $scope.claimedToShow;
						$scope.list[studentIndex].consent = $scope.consentToShow;
						$scope.list[studentIndex].attendance = $scope.attendanceToShow;

						// Save ang updated list to local storage
						localStorage.setItem("studentlist", JSON.stringify($scope.list));
						
						alert("Updated");

						// Close edit modal 
						document.getElementById('openOrderModal').style.display = "none";
					} 
				}

					//save button ni sa EDIT MODAL gois
				$scope.saveEdit = function() {
					var studentIndex = -1;

					// check ang idno sa list para kbaw asa ang e update base sa idno sa gi edit
					for (var i = 0; i < $scope.list.length; i++) {
						if ($scope.list[i].idno === $scope.idnoToShow) {
							studentIndex = i;
							break;
						}
					}

					if (studentIndex !== -1) {
						$scope.list[studentIndex].lastname = $scope.lastnameToShow;
						$scope.list[studentIndex].firstname = $scope.firstnameToShow;
						$scope.list[studentIndex].course = $scope.courseToShow;
						$scope.list[studentIndex].level = $scope.levelToShow;

						// Save ang updated list to local storage
						localStorage.setItem("studentlist", JSON.stringify($scope.list));
						
						alert("Updated Student");

						// Close edit modal 
						document.getElementById('openModal').style.display = "none";
					} 
				};
						
				//delete button updated version ni gois
				$scope.delete = function(idno){
					var result = confirm("Are you sure you want to delete this?");
					if (result){
						for (i in $scope.list) {
							if ($scope.list[i].idno === idno) {
								$scope.list.splice(i,1);
								break;
							}
						}
						localStorage.setItem("studentlist",JSON.stringify($scope.list));
					}		
				}
				
				

				// Insurance
				$scope.checkedCount = 0;
				$scope.insurance = function () {
					for (var i = 0; i < $scope.list.length; i++) {
						if ($scope.list[i].isChecked) {
							$scope.checkedCount++;
						}
					}
					localStorage.setItem("insuranceCount", $scope.checkedCount);
				};
				//Consent
				$scope.checkedCount1 = 0;
				$scope.updateCheckedCount1 = function () {
				var student = {'idno':$scope.idno,}
				$scope.checkedCount1 = 0; // Reset count
					for (var i = 0; i < $scope.list.length; i++) {
						if ($scope.list[i].isChecked1) {
							$scope.checkedCount1++;
							$scope.list[i].insurance = true;							
						}
					}
					localStorage.setItem("consentCount", $scope.checkedCount1);
				};
				//Claimed
				$scope.checkedCount2 = 0;
				$scope.updateCheckedCount2 = function () {
				$scope.checkedCount2 = 0; // Reset count
					for (var i = 0; i < $scope.list.length; i++) {
						if ($scope.list[i].isChecked2) {
							$scope.checkedCount2++;
						}
					}
					localStorage.setItem("claimedCount", $scope.checkedCount2);
				};
				//Attended
				$scope.checkedCount3 = 0;
				$scope.updateCheckedCount3 = function () {
				$scope.checkedCount3 = 0; // Reset count
					for (var i = 0; i < $scope.list.length; i++) {
						if ($scope.list[i].isChecked3) {
							$scope.checkedCount3++;
						}
					}
					localStorage.setItem("attendedCount", $scope.checkedCount3);
				};

				// Load checked counts from local storage when the admin logs in
				$scope.loadCheckedCounts = function () {
					$scope.checkedCount = parseInt(localStorage.getItem("insuranceCount")) || 0;
					$scope.checkedCount1 = parseInt(localStorage.getItem("consentCount")) || 0;
					$scope.checkedCount2 = parseInt(localStorage.getItem("claimedCount")) || 0;
					$scope.checkedCount3 = parseInt(localStorage.getItem("attendedCount")) || 0;
				};

				// Call loadCheckedCounts when the controller initializes
				$scope.loadCheckedCounts();
				
					

				$scope.list = [];
				$scope.list = JSON.parse(localStorage.getItem("studentlist"));
				if($scope.list==null){
					$scope.list=[];
				}
			
				$scope.save = function(){
					var student = {
						'idno':$scope.idno,
						'pass':$scope.pass,
						'lastname':$scope.lastname,
						'firstname':$scope.firstname,
						'course':$scope.course,
						'size':$scope.size,
						'level':$scope.level,
						'amount':$scope.amount,
					}
					if (($scope.idno == null) ||($scope.pass == null)||($scope.lastname == null) || ($scope.firstname == null) ||($scope.course == null)||($scope.level == null)||($scope.size == null)){
						alert ("Please Fill In All Required Fields");
					} else {
						$scope.list.push(student);
						localStorage.setItem("studentlist",JSON.stringify($scope.list));
						alert("New Student Added");
						document.getElementById('idno').value="";
						document.getElementById('pass').value="";
						document.getElementById('lastname').value="";
						document.getElementById('firstname').value="";
						document.getElementById('course').value="";
						document.getElementById('size').value="";
						document.getElementById('amount').value="";
						document.getElementById('level').value="";
						document.getElementById('idno').focus();
					}
				}
				
				$scope.totalAmount = function(){
					var total = 0.0;
					for (var i = 0; i < $scope.list.length; i++) {
						// Check if amount is null or undefined
						if ($scope.list[i].amount == null || isNaN(parseFloat($scope.list[i].amount))) {
							// ig add og new student, ang value sa amount instead of null 
							//(w/c is null mn gyd sya then if e parseFloat ang null ang labas ky NaN na sya (not a number :>))
							//so diri ma set na into 0 ang new added student :>>
							total += 0.0;
						} else {
							// Otherwise, e parse ang amount and add it to totals
							total += parseFloat($scope.list[i].amount);
						}
					}
					return total.toFixed(2);
				}

				$scope.countYear = function(year) {

					var counts = {
						 'count1' : 0,
						 'count2' : 0,
						 'count3' : 0,
						 'count4' : 0
					};

					if (year === "1st Year") {
						for (var i = 0; i < $scope.list.length; i++) {
							// Check if amount is null or undefined
							if ($scope.list[i].level === "1" ) {
								counts.count1++;
							}
						}
					}
					else if (year === "2nd Year") {
						for (var i = 0; i < $scope.list.length; i++) {
							// Check if amount is null or undefined
							if ($scope.list[i].level === "2" ) {
								counts.count2++;
							}
						}
					}
					else if (year === "3rd Year") {
						for (var i = 0; i < $scope.list.length; i++) {
							// Check if amount is null or undefined
							if ($scope.list[i].level === "3" ) {
								counts.count3++;
							}
						}
					}
					else if (year === "4th Year") {
						for (var i = 0; i < $scope.list.length; i++) {
							// Check if amount is null or undefined
							if ($scope.list[i].level === "4" ) {
								counts.count4++;
							}
						}
					}
					return counts;
				}
				
				$scope.totalStudents = function(){
					var rowCount = document.getElementById('myTable').rows.length-1;
					return rowCount;
				}
				
				
				$scope.totalPaid = function(){
					var paid=0;
					for(var i = 0; i<$scope.list.length;i++){
						if ($scope.list[i]['amt'] > 0){
							paid++;
						}
					}
					return paid;
				}
				
				$scope.logout = function(){
					$rootScope.logged=false;
					$rootScope.message="";
					$rootScope.loggedUser="";
					$location.path("/");
				}
				//
				$scope.numberOfPages = function(){
					return
					Math.ceil($scope.students.length/$scope.pageSize);
				}
			});
//
			app.filter("startFrom",function(){
				return function(input,start){
						start =+ start;
					return input.slice(start);
				}
			});


////////
