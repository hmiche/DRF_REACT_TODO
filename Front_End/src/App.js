
import './App.css';

import React, { Component } from 'react'

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: 'fffffffff',
        completed: false
      },
      editing: false,
    };
    this.fetchTasks=this.fetchTasks.bind(this);
    this.handleChange=this.handleChange.bind(this);
    this.handlesubmit=this.handlesubmit.bind(this);
    this.getcookie=this.getcookie.bind(this);
    this.startEdit=this.startEdit.bind(this);
    this.deleteItem=this.deleteItem.bind(this);
    this.strikeUnstrike=this.strikeUnstrike.bind(this);
  };
  
  getcookie(name){
    var cookieValue=null;
    if(document.cookie && document.cookie !== ''){
      var cookies=document.cookie.split(';');
      for(var i=0;i<cookies.length;i++){
        var cookie=cookies[i].trim();
        if(cookie.substring(0,name.length+1)===(name+'=')){
          cookieValue=decodeURIComponent(cookie.substring(name.length+1));
          break;
        }
      }
    }
    return cookieValue;
  }

  componentWillMount() {
    this.fetchTasks();
  }

  fetchTasks() {
    console.log('Fetching...');
    fetch('http://127.0.0.1:8000/api/task-list/')
    .then(response => response.json())
    .then(data =>
     this.setState({
      todoList: data
    })
    );
  }

  handleChange(e) {
    var name = e.target.name
    var value = e.target.value
    console.log('Name:', name)
    console.log('Value:', value)
    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value
      }
    })
  }

  handlesubmit(e) {
    e.preventDefault()
    console.log('ITEM:', this.state.activeItem)
    var csrftoken=this.getcookie('csrftoken');
    var url = 'http://127.0.0.1:8000/api/task-create/'

    if (this.state.editing === true) {
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`
      this.setState({
        editing: false
      })
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken':csrftoken,
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTasks()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          completed: false
        }
      })
    }).catch(function (error) {
      console.log('ERROR:', error)
    })
  }

  startEdit(task){ 
    this.setState({
      activeItem:task,
      editing:true,
    })
  }

  deleteItem(task){
    var csrftoken=this.getcookie('csrftoken');
    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`,{
      method:'DELETE',
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      },
    }).then((response)=>{
      this.fetchTasks()
    })
  
  }

    strikeUnstrike(task){
      task.completed=!task.completed
      var csrftoken=this.getcookie('csrftoken');
      var url = `http://127.0.0.1:8000/api/task-update/${task.id}/`
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'X-CSRFToken':csrftoken,
        },
        body: JSON.stringify({'title':task.title,'completed':task.completed})
      }).then((response) => {
        this.fetchTasks()
      })

    }
 render() {
    var tasks=this.state.todoList;
    var self=this;
    return (
      <div className='container'>
        <div id="task-container">
          <div id='form-wrapper'>
            <form onSubmit={this.handlesubmit} id='form'>
              <div className='flex-wrapper'>
                <div style={{ flex: 6 }}>
                  <input onChange={this.handleChange} className='form-control' id='title' type='text' value={this.state.activeItem.title} name='title' placeholder='Add task' />
                </div>

                <div style={{ flex: 1 }}>
                  <input className='btn btn-warning' id='submit' type='submit' name='Add' />
                </div>
              </div>
            </form>
          </div>
          <div id="list-wrapper">
              {tasks.map(function(task,index){
                return(
                  <div key={index} className='task-wrapper flex-wrapper'>
                    <div onClick={() => self.strikeUnstrike(task)} style={{flex:7}}>
                      {task.completed === false ?( 
                        <span>{task.title}</span>
                      ):(
                        <strike>{task.title}</strike>
                      )
                      }
                    </div>
                    <div style={{flex:1}}>
                      <button onClick={() => self.startEdit(task)} className='btn btn-sm btn-outline-info'>Edit</button>
                    </div>
                    <div style={{flex:1}}>
                      <button onClick={() => self.deleteItem(task)} className='btn btn-sm btn-outline-dark delete'>-</button>
                    </div>
                  </div>
                )
              })}
              
        </div>
      </div>

      </div>
    )
  }
}

