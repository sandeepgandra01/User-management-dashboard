
import React,{useMemo,useState} from 'react';
import {Container,Paper,Button,TextField,Table,TableBody,TableCell,TableHead,TableRow,Dialog,DialogTitle,DialogContent,Snackbar,Alert,CircularProgress,Select,MenuItem,Pagination} from '@mui/material';
import useUsers from './hooks/useUsers';
import api from './services/api';

export default function App(){
const {users,setUsers,loading,error}=useUsers();
const [search,setSearch]=useState('');
const [sort,setSort]=useState('asc');
const [department,setDepartment]=useState('');
const [page,setPage]=useState(1);
const [limit,setLimit]=useState(10);
const [open,setOpen]=useState(false);
const [toast,setToast]=useState('');
const [editId,setEditId]=useState(null);
const [form,setForm]=useState({firstName:'',lastName:'',email:'',department:''});

const filtered=useMemo(()=>{
 let data=users.filter(u=>
 JSON.stringify(u).toLowerCase().includes(search.toLowerCase()) &&
 (!department || u.department===department));
 data.sort((a,b)=>sort==='asc'?a.firstName.localeCompare(b.firstName):b.firstName.localeCompare(a.firstName));
 return data;
},[users,search,department,sort]);

const pageData=filtered.slice((page-1)*limit,page*limit);

const save=async()=>{
 if(!form.firstName||!form.lastName||!form.email){setToast('All fields are required');return;}
 const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if(!email.test(form.email)){setToast('Invalid email');return;}
 try{
  if(editId){
   await api.put('/users/'+editId,form);
   setUsers(users.map(u=>u.id===editId?{...form,id:editId}:u));
   setToast('User updated');
  }else{
   const nextId =
  users.length === 0
    ? 1
    : Math.max(...users.map(u => u.id)) + 1;

await api.post('/users', form);

setUsers([
  ...users,
  {
    ...form,
    id: nextId
  }
]);
   setToast('User added');
  }
 }catch{setToast('Operation failed');}
 setOpen(false);setEditId(null);
 setForm({firstName:'',lastName:'',email:'',department:''});
};

const del=async(id)=>{
 if(!window.confirm('Delete this user?')) return;
 await api.delete('/users/'+id);
 setUsers(users.filter(u=>u.id!==id));
 setToast('User deleted');
};

if(loading) return <Container sx={{mt:4}}><CircularProgress/></Container>;

return <Container sx={{mt:4}}>
<Paper sx={{p:2}}>
<h2>User Management Dashboard</h2>
{error && <Alert severity='error'>{error}</Alert>}
<TextField label='Search' size='small' sx={{mr:1}} onChange={e=>setSearch(e.target.value)}/>
<Select size='small' value={department} onChange={e=>setDepartment(e.target.value)} sx={{mr:1,width:150}}>
<MenuItem value=''>All</MenuItem><MenuItem value='IT'>IT</MenuItem><MenuItem value='HR'>HR</MenuItem><MenuItem value='Finance'>Finance</MenuItem><MenuItem value='Admin'>Admin</MenuItem>
</Select>
<Select size='small' value={sort} onChange={e=>setSort(e.target.value)} sx={{mr:1,width:120}}>
<MenuItem value='asc'>A-Z</MenuItem><MenuItem value='desc'>Z-A</MenuItem>
</Select>
<Select size='small' value={limit} onChange={e=>setLimit(e.target.value)} sx={{mr:1,width:100}}>
<MenuItem value={10}>10</MenuItem><MenuItem value={25}>25</MenuItem><MenuItem value={50}>50</MenuItem><MenuItem value={100}>100</MenuItem>
</Select>
<Button variant='contained' onClick={()=>setOpen(true)}>Add User</Button>

<Table>
<TableHead><TableRow><TableCell>ID</TableCell><TableCell>First Name</TableCell><TableCell>Last Name</TableCell><TableCell>Email</TableCell><TableCell>Department</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
<TableBody>
{pageData.map(u=><TableRow key={u.id}>
<TableCell>{u.id}</TableCell><TableCell>{u.firstName}</TableCell><TableCell>{u.lastName}</TableCell><TableCell>{u.email}</TableCell><TableCell>{u.department}</TableCell>
<TableCell>
<Button onClick={()=>{setEditId(u.id);setForm(u);setOpen(true)}}>Edit</Button>
<Button color='error' onClick={()=>del(u.id)}>Delete</Button>
</TableCell>
</TableRow>)}
</TableBody>
</Table>

<Pagination sx={{mt:2}} page={page} onChange={(e,v)=>setPage(v)} count={Math.max(1,Math.ceil(filtered.length/limit))}/>

<Dialog open={open} onClose={()=>setOpen(false)}>
<DialogTitle>{editId?'Edit User':'Add User'}</DialogTitle>
<DialogContent>
<TextField fullWidth margin='dense' label='First Name' value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/>
<TextField fullWidth margin='dense' label='Last Name' value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/>
<TextField fullWidth margin='dense' label='Email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
<TextField fullWidth margin='dense' label='Department' value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/>
<Button variant='contained' sx={{mt:2}} onClick={save}>Save</Button>
</DialogContent>
</Dialog>

<Snackbar open={!!toast} autoHideDuration={3000} onClose={()=>setToast('')}>
<Alert severity='success'>{toast}</Alert>
</Snackbar>
</Paper>
</Container>
}
