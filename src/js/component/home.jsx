import React, { useState, useEffect } from 'react';
import { ToDoList } from './toDoList';

const Home = () => {
  const [newTask, setNewTask] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [usersName, setUsersName] = useState([]);
  const [userSelected, setUserSelected] = useState("");
  const [error, setError] = useState("");

  const getUsers = async () => {
    try {
      const userResp = await fetch("https://playground.4geeks.com/todo/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      });
      if (!userResp.ok) throw new Error('Error fetching users');
      const userData = await userResp.json();
      setUsersName(userData.users);
    } catch (error) {
      setError(`Error fetching users: ${error.message}`);
    }
  };

  const fetchUserTasks = async (username) => {
    try {
      const userResp = await fetch(`https://playground.4geeks.com/todo/users/${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      });
      if (!userResp.ok) {
        const errorDetails = await userResp.text();
        throw new Error(`Error fetching tasks: ${userResp.status} - ${errorDetails}`);
      }
      const userData = await userResp.json();
      setTaskList(userData.todos);
    } catch (error) {
      setError(`Error fetching tasks for user ${username}: ${error.message}`);
    }
  };

  const catchUser = (user) => {
    setUserSelected(user);
    fetchUserTasks(user);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const updateServerTasks = async (tasks) => {
    if (userSelected) {
      try {
        const userResp = await fetch(`https://playground.4geeks.com/todo/todos/10` , {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ todos: tasks })
        });
        if (!userResp.ok) throw new Error('Error updating tasks');
        const userData = await userResp.json();
        console.log(userData);
      } catch (error) {
        setError(`Error updating tasks: ${error.message}`);
      }
    }
  };
  const deleteServerTasks = async (task) => {
    console.log(task);
  
   
    const deleteTaskList = taskList.filter((taskFilter) => taskFilter.id !== task.id);
  
    if (userSelected) {
      try {
        const userResp = await fetch('https://playground.4geeks.com/todo/todos/10', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ todos: deleteTaskList })
        });
  
       
        if (!userResp.ok) throw new Error('Error updating tasks');
  
        const userData = await userResp.json();
        console.log(userData);
  
        
        setTaskList(deleteTaskList);
        
      } catch (error) {
        setError(`Error updating tasks: ${error.message}`);
      }
    }
  };

  const addNewTask = async (task) => {
    const updatedTaskList = [...taskList, { label: task, done: false }];
    setTaskList(updatedTaskList);
    await updateServerTasks(updatedTaskList);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (newTask.trim() !== "") {
      await addNewTask(newTask);
      setNewTask("");
    }
  };



  return (
    <main className="container">
      <h1>To Do List</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <div className="col-md-5">
          <div className="card shadow-sm card-small">
            <div className="card-body select-user-container">
              <h2 className="select-user">Users</h2>
              <div>
                {usersName.map((user, index) => (
                  <p key={index} onClick={() => catchUser(user.name)}>{user.name}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="card shadow-sm card-large">
            <div className="card-body">
              <h2>{userSelected}</h2>
              <form onSubmit={handleFormSubmit} className="mb-4">
                <div className="form-group">
                  <input
                    value={newTask}
                    onChange={(event) => setNewTask(event.target.value)}
                    className="form-control form-control-lg"
                    placeholder="What needs to be done?"
                    id="new-task-input"
                    name="new-task-input"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm mt-2" disabled={!userSelected}>Add Task</button>
              </form>
              <ToDoList taskList={taskList} onDeleteTask={deleteServerTasks} />
            </div>
            <div className="card-footer">
              {taskList.length} item{taskList.length !== 1 ? 's' : ''} left
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;