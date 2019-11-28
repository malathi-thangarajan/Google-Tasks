var client;
var list, input, taskList;
const CHECK = "fa-check-circle";
const UNCHECK = "fa-circle-thin";
const LINE_THROUGH = "lineThrough", POSITION = "beforeend";
var id;
var parentDiv;

var taskCreateInput;

$(document).ready( function() {
	app.initialized()
		.then(function(_client) {
			client = _client;
			client.events.on('app.activated',
				function() {
				    id = 0;
					taskList = document.getElementById("taskList");
					parentDiv = document.getElementById("taskListDiv");
					taskCreateInput = document.getElementById("taskList-text-box");
					taskCreateInput.addEventListener("keyup",function(event){
						if(event.keyCode === 13){

							if(taskCreateInput.value){
								removeTextAndInsertSelect(taskCreateInput, taskList);
								createTaskList(taskCreateInput.value, (res) => getTaskList(loadTaskLists));
							}
							input.value = "";
						}
					});

					parentDiv.removeChild(taskCreateInput);
					list = document.getElementById("list");
					input = document.getElementById("input");
					//add an item to the list
					document.addEventListener("keyup",function(event){
						if(event.keyCode === 13){
							//if the input isnt empty
							if(input.value){
								createTask(input.value, "", undefined, addSingletask);
							}
							input.value = "";
						}
					});

					//target the items created dynamically
					list.addEventListener("click", function(event) {
						const element = event.target; //return the clicked element inside the list
						const elementJob = element.attributes.job;
						if (elementJob !== undefined) {
							const clickValue = elementJob.value;
							if (clickValue === "complete") {
								// Old Checked Status
								isAlreradyCompleted = element.attributes.isCompleted.value;
								updateTaskStatus(element.attributes.taskID.value, isAlreradyCompleted != "true", completeToDo, element);
							} else if (clickValue === "delete") {
								deleteTask(element.attributes.taskID.value, removeToDo, element);
							}
						}
					});

					document.getElementById("taskCreate").addEventListener("click", function (event) {

						parentDiv.removeChild(taskList);
						parentDiv.appendChild(taskCreateInput);
					});

					taskList.addEventListener("change", (event) => {
						getTasks(loadTasks);
					});

					getTaskList(loadTaskLists);

					/**
					 ***** Sample Methods ************************
					 *
					 *
					 *   //createTaskList('My Created Task 5');
					 *   //getTasks('MTM1OTc4MDU2OTE5NjgyNTIxMDY6MDow');
					 *   //deleteTask("MTM1OTc4MDU2OTE5NjgyNTIxMDY6MDow", "S3d6SmRHMGh0RjF6ZE9jYw");
					 *   getTaskList();
					 *   //updateTaskList("YkpjXzNjYUEwYXgybXNheg", "Updated task List");
					 *   //deleteTaskList("YkpjXzNjYUEwYXgybXNheg");
					 *   //createTask("My Task 1", "Notes for My Task 1", (new Date()).toISOString());
					 *   //updateTask("MTM1OTc4MDU2OTE5NjgyNTIxMDY6MDow", "SXRnWVJtdWZieF82S2NDNw", "My Task 12", "Notes for My Task 12", (new Date()).toISOString());
					 */
				});
		});
});

function removeTextAndInsertSelect(textBox, selectOpt) {
	parentDiv.removeChild(textBox);
	parentDiv.appendChild(selectOpt);
}


// TASK LIST RELATED METHODS

function getTaskList(successCallBack) {
	invokeAPI("https://www.googleapis.com/tasks/v1/users/@me/lists", 'GET', undefined, successCallBack);
}

function createTaskList(title, successCallBack) {
	reqData = {title: title};
	invokeAPI("https://www.googleapis.com/tasks/v1/users/@me/lists", 'POST', reqData, successCallBack);
}

function updateTaskList(taskListID, title) {
	reqData = {id:taskListID, title: title};
	invokeAPI("https://www.googleapis.com/tasks/v1/users/@me/lists/" + taskListID, 'PUT', reqData);
}

function deleteTaskList(taskListID) {
	invokeAPI("https://www.googleapis.com/tasks/v1/users/@me/lists/" + taskListID, 'DELETE');
}


// TASK RELATED METHODS

function getTasks(successCallBack) {
	invokeAPI("https://www.googleapis.com/tasks/v1/lists/" + getTaskListID() + "/tasks", 'GET', undefined, successCallBack);
}

function createTask(title, notes, timeStamp, successCallBack) {
	// @TODO Need to update a due time stamp
	var reqData = {title:title, notes:notes};
	invokeAPI("https://www.googleapis.com/tasks/v1/lists/" + getTaskListID() + "/tasks", 'POST', reqData, successCallBack);
}

function updateTask(taskListId, taskID, title, notes, timeStamp) {
	var reqData = { id:taskID, title:title, notes:notes, due:timeStamp };
	invokeAPI("https://www.googleapis.com/tasks/v1/lists/" + taskListId + "/tasks/" + taskID, 'PUT', reqData);
}

function updateTaskStatus(taskID, isCompleted, successCallBack, element) {
	var reqData = { id:taskID, status:"needsAction"};
	if (isCompleted)
	{
		reqData.status = "completed";
	}
	invokeAPI("https://www.googleapis.com/tasks/v1/lists/" + getTaskListID() + "/tasks/" + taskID, 'PUT', reqData, successCallBack, undefined, element);
}

function deleteTask(taskID, successCallBack, additionalParams) {
	invokeAPI("https://www.googleapis.com/tasks/v1/lists/" + getTaskListID() + "/tasks/" + taskID, 'DELETE', undefined, successCallBack, undefined, additionalParams);
}

// To make a global API call.
function invokeAPI(url, method, data, successCallBack, failureCallBack, additionalParams)
{
	url = url + "?key=AIzaSyBtXBBgIIUHqeDz_dcui7p8Iroujhq5OAI";
	let headers = { Authorization: "Bearer <%= access_token %>",
		Accept : "*/*", "Cache-Control" : "no-cache",
		"Content-Type" : "application/json"};

	let reqData = { method: method, headers: headers, isOAuth: true };

	if (method !== 'GET' && method !== 'DELETE')
	{
		reqData.body = JSON.stringify(data);
	}

	let target;
	switch (method) {
		case 'POST':
			target = client.request.post(url, reqData);
			break;
		case 'DELETE':
			target = client.request.delete(url, reqData);
			break;
		case 'PUT':
			target = client.request.put(url, reqData);
			break;
		default:
			target = client.request.get(url, reqData);
			break;
	}

	target.then(
		function(response) {

			//console.log(response);
			// If there is no content then we will ignore the response.
			if (response.status !== 204) {
				var r = JSON.parse(response.response);
				//console.log("Success Response: ", r);
			}
			handleCallback(successCallBack, response, additionalParams);
		},
		function(error) {
			//console.log("error:", error);
			//console.log("error status:", error.status);
			handleCallback(failureCallBack, error, additionalParams);
		}
	);
}

function handleCallback(callback, arg, additionalParams) {
	if (callback !== undefined)
	{
		if (additionalParams !== undefined)
		{
			callback(arg, additionalParams);
		}
		else
		{
			callback(arg);
		}
	}
}

// ************************************************************************************************************
// ************************************************************************************************************

/*function initDefaultTaskList(res) {

	array = JSON.parse(res.response).items;
	if (array === undefined || array[0] === undefined)
	{
		createTaskList("Freshworks-Default", initDefaultTaskListAfterCreate);
	}
	else
	{
		globalTaskListID = array[0].id;
		getTasks(globalTaskListID, loadTasks);
	}
}

function initDefaultTaskListAfterCreate(res) {
	array = JSON.parse(res.response).items;
	globalTaskListID = array[0].id;
	getTasks(globalTaskListID, loadTasks);
}*/

//complete to do
function completeToDo(agr, element )
{
	element.classList.toggle(CHECK);
	element.classList.toggle(UNCHECK);
	if (element.attributes.isCompleted.value == "true")
	{
		element.attributes.isCompleted.value = "false";
	}
	else
	{
		element.attributes.isCompleted.value = "true";
	}
	element.parentNode.querySelector(".text").classList.toggle(LINE_THROUGH);
}

// remove to do
function removeToDo( agr, element){
	element.parentNode.parentNode.removeChild(element.parentNode);
}

//load items to the user's interface
function loadTasks(obj) {
	while ((lis = list.getElementsByTagName("li")).length > 0) {
		list.removeChild(lis[0]);
	}
	id = 0;
	array = JSON.parse(obj.response).items;
	// Empty Array Handling
	if (array !== undefined) {
		array.sort(compare);
		array.forEach(function (item) {
			addToDo(item.title, ++id, item.id, item.status === "completed", false);
		});
	}
}

function loadTaskLists(obj){
	// console.log("Lask List:", obj);
	// Remove all the old tasks.
	while ((lis = taskList.getElementsByTagName("option")).length > 0) {
		taskList.removeChild(lis[0]);
	}

	array = JSON.parse(obj.response).items;
	let count = 1;
	array.forEach(function(item){
		addTaskList(item.title, item.id, count++);
	});
	getTasks(loadTasks);
	setInterval(getTasks, (1000 * 100), loadTasks);
}

function addTaskList(title, id, count){
	const selected = count === 1 ? "selected" : "";
	const item = `
            <option class="optionItem" id="${id}" ${selected}>
            ${title}
            </option>
            `;
	taskList.insertAdjacentHTML(POSITION, item);
}

function getTaskListID() {
	const ele = taskList.options[taskList.selectedIndex];
	if (ele !== undefined)
	{
		return ele.id;
	}
	return undefined;
}

function addSingletask(obj) {
  item = JSON.parse(obj.response);
  id++;
  addToDo(item.title, id, item.id, false, false);
}

//add to do function
function addToDo(toDo, id, taskID, done, trash){
	if(trash){
		return;
	}
	const DONE = done ? CHECK : UNCHECK;
	const LINE = done ? LINE_THROUGH : "";
	//#E6FFFF
	const COLOR = id % 2 === 0 ? "": "#FAF5FC";
	const item = `
            <li class="item" style="background: ${COLOR}">
            <i class="fa ${DONE} co" job="complete" isCompleted="${done}" taskID="${taskID}" id="${id}"></i>
            <p class="text ${LINE}">${toDo}</p>
            <i class="fa fa-trash-o de" job="delete" taskID="${taskID}" id="${id}"></i>
            </li>
            `;
	const position = "beforeend";
	list.insertAdjacentHTML(position,item);
}

function compare( a, b ) {
	let d1 = new Date(a.updated).getTime();
	let d2 = new Date(b.updated).getTime();
	if ( d1 < d2 ){
		return -1;
	}
	if ( d1 > d2 ){
		return 1;
	}
	return 0;
}
