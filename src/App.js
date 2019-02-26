import React, { Component } from 'react';
import { API, graphqlOperation  } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react';
import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'


class App extends Component {

  state={
    id: "",
   note: "",
   notes: []
  };

  async componentDidMount(){
    const result = await API.graphql(graphqlOperation(listNotes))
    this.setState({notes: result.data.listNotes.items}); 
  }

  handleChangeNote = event => this.setState({ note: event.target.value })

  //function to check if there is any existing note
  hasExistingNote = () => {
    const { notes, id} = this.state;
    if(id){
      const isNote = notes.findIndex(note => note.id === id) > -1;
      return isNote;
    }
    return false;
   }


  handleAddNote = async event => {
    const { note, notes } = this.state;
    event.preventDefault()
    //check if we have an existing note, if so then update it if not then create a new note
    if(this.hasExistingNote()){
      this.handleUpdateNote()
    }
    else {
      const input = { note };
      const result = await API.graphql(graphqlOperation(createNote, { input }));
      const newNote  = result.data.createNote
      const updatedNotes = [newNote, ...notes]
      this.setState({ notes: updatedNotes, note: ""});
    }
  };

  handleUpdateNote = async () => {
    const { notes, id, note } = this.state;
    const input = { id, note}
    const result = await API.graphql(graphqlOperation(updateNote, { input }))
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex(note => note.id === updatedNote.id) 
    const updatedNotes = [
      ...notes.slice(0, index),
      updatedNote,
      ...notes.slice(index + 1)
    ]
    this.setState({ notes: updatedNotes, note: "", id: ""});
  }

  handleDeleteNote = async noteId => {
    const { notes } = this.state;
    const input = { id: noteId}
    const result = await API.graphql(graphqlOperation(deleteNote, {input}))
    const deletedNoteId = result.data.deleteNote.id;
    const updatedNotes = notes.filter(note => note.id != deletedNoteId)
    this.setState({ notes: updatedNotes});
  }

  handleSetNote = ({note, id}) => this.setState({note, id});

  render() {

    const { id, notes, note }= this.state;

    return (
      <div className="flex flex-column items-center justify-center pa3
      bg-washed-red">
      <h1 className="code f2-l">
      Amplify note taker
      </h1>
      { /*note from*/}
      <form onSubmit = { this.handleAddNote } className="mb3">
      <input type="text" className="pa2 f4" 
        place holder="Write your note"
        onChange={this.handleChangeNote} 
        value={note}
        />
      <button className="pa2 f4" type="submit">
        { id ? "Update Note" : "Add Note"}
      </button>
      </form>

      {/*Notes List*/}

      <div>
        {notes.map(item => (
          <div key={item.id} className="flex items-center">
          <li onClick = {() =>  this.handleSetNote(item)} className="list pa1 f3">
          {item.note}
          </li>
          <button onClick = {() =>  this.handleDeleteNote(item.id )} className="bg-transparent bn f4">
          <span>&times;</span>
           </button>
          </div>
        ))}

      </div>

      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
