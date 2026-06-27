
import {useEffect,useState} from 'react';
import api from '../services/api';
export default function useUsers(){
 const [users,setUsers]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{load();},[]);
 const load=async()=>{
   try{
    const r=await api.get('/users');
    setUsers(r.data.map((u,i)=>({...u,firstName:u.name.split(' ')[0],lastName:u.name.split(' ').slice(1).join(' '),department:['IT','HR','Finance','Admin'][i%4]})));
   }catch{setError('Failed to fetch users');}
   finally{setLoading(false);}
 };
 return {users,setUsers,loading,error};
}
