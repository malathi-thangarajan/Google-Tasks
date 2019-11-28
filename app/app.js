var client;
var list, input;
const CHECK = "fa-check-circle";
const UNCHECK = "fa-circle-thin";
const LINE_THROUGH = "lineThrough";
var id, globalTaskListID;

$(document).ready( function() {
	app.initialized()
		.then(function(_client) {
			client = _client;
			client.events.on('app.activated',
				function() {
				    id = 0;
					list = document.getElementById("list");
					input = document.getElementById("input");
					//add an item to the list
					document.addEventListener("keyup",function(event){
						if(event.keyCode === 13){
							const toDo = input.value;
							//if the input isnt empty
							if(toDo){
								createTask(globalTaskListID, toDo, "", (new Date()).toISOString(), addSingletask);
							}
							input.value = "";
						}
					});

					//target the items created dynamically
					list.addEventListener("click", function(event){
						const element = event.target; //return the clicked element inside the list
						const elementJob = element.attributes.job.value;
						if(elementJob === "complete"){
							updateTaskAsCompleted(globalTaskListID, element.attributes.taskID.value, completeToDo, element);
						} else if(elementJob === "delete"){
							deleteTask(globalTaskListID, element.attributes.taskID.value, removeToDo, element);
						}
					});



					getTaskList(initDefaultTaskList);
					//createTask("MTM1OTc4MDU2OTE5NjgyNTIxMDY6MDow", "My Task 12", "Notes for My Task 12", (new Date()).toISOString(), addSingletask);

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


// TASK LIST RELATED METHODS

function getTaskList(successCallBack) {
	invokeAPI("https://www.googleapis.com/tasks/v1/users/@me/lists", 'GET', undefined, successCallBack);
}

function createTaskList(title) {
	reqData = {title: title};
	invokeAPI("https://www.googleapis.com/tasks/v1/users/@me/lists", 'POST', reqData);
}

function updateTaskList(taskListID, title) {
	reqData = {id:taskListID, title: title};
	invokeAPI("https://www.googleapis.com/tasks/v1/users/@me/lists/" + taskListID, 'PUT', reqData);
}

function deleteTaskList(taskListID) {
	invokeAPI("https://www.googleapis.com/tasks/v1/users/@me/lists/" + taskListID, 'DELETE');
}


// TASK RELATED METHODS

function getTasks(taskListId, successCallBack) {
	invokeAPI("https://www.googleapis.com/tasks/v1/lists/" + taskListId + "/tasks", 'GET', undefined, successCallBack);
}

function createTask(taskListId, title, notes, timeStamp, successCallBack) {
	var reqData = {title:title, notes:notes, due:timeStamp};
	invokeAPI("https://www.googleapis.com/tasks/v1/lists/" + taskListId + "/tasks", 'POST', reqData, successCallBack);
}

function updateTask(taskListId, taskID, title, notes, timeStamp) {
	var reqData = { id:taskID, title:title, notes:notes, due:timeStamp };
	invokeAPI("https://www.googleapis.com/tasks/v1/lists/" + taskListId + "/tasks/" + taskID, 'PUT', reqData);
}

function updateTaskAsCompleted(taskListId, taskID, successCallBack, element) {
	var reqData = { id:taskID, status:"completed"};
	invokeAPI("https://www.googleapis.com/tasks/v1/lists/" + taskListId + "/tasks/" + taskID, 'PUT', reqData, successCallBack, undefined, element);
}

function deleteTask(taskListId, taskID, successCallBack, additionalParams) {
	invokeAPI("https://www.googleapis.com/tasks/v1/lists/" + taskListId + "/tasks/" + taskID, 'DELETE', undefined, successCallBack, undefined, additionalParams);
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

			console.log(response);
			// If there is no content then we will ignore the response.
			if (response.status !== 204) {
				var r = JSON.parse(response.response);
				console.log("Success Response: ", r);
			}
			handleCallback(successCallBack, response, additionalParams);
		},
		function(error) {
			console.log("error:", error);
			console.log("error status:", error.status);
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

function initDefaultTaskList(res) {

	array = JSON.parse(res.response).items;
	if (array === undefined || array[0] === undefined)
	{
		createTaskList("Freshworks-Default", initDefaultTaskListAfterCreate);
	}
	else
	{
		globalTaskListID = array[0].id;
		getTasks(globalTaskListID, loadList);
	}
}

function initDefaultTaskListAfterCreate(res) {
	array = JSON.parse(res.response).items;
	globalTaskListID = array[0].id;
	getTasks(globalTaskListID, loadList);
}

//complete to do
function completeToDo(agr, element )
{
	element.classList.toggle(CHECK);
	element.classList.toggle(UNCHECK);
	element.parentNode.querySelector(".text").classList.toggle(LINE_THROUGH);
}

// remove to do
function removeToDo( agr, element){
	element.parentNode.parentNode.removeChild(element.parentNode);
}

//load items to the user's interface
function loadList(obj){
	array = JSON.parse(obj.response).items;
	array.forEach(function(item){
		addToDo(item.title, ++id, item.id, item.status === "completed", false);
	});
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
	const item = `
            <li class="item">
            <i class="fa ${DONE} co" job="complete" taskID="${taskID}" id="${id}"></i>
            <p class="text ${LINE}">${toDo}</p>
            <i class="fa fa-trash-o de" job="delete" taskID="${taskID}" id="${id}"></i>
            </li>
            `;
	const position = "beforeend";
	list.insertAdjacentHTML(position,item);
}