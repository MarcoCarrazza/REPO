import axios from 'axios';

export default axios.create({
  // baseURL: 'http://localhost:5500/api'
  baseURL: 'https://teams-manager.herokuapp.com/api'
})