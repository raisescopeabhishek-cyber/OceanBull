import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {legacy_createStore} from 'redux';
import {MemoryRouter,Routes,Route,useLocation} from 'react-router-dom';
import ThemeProvider from './src/theme/ThemeProvider';
import AdminLayout from './src/layouts/AdminLayout';
import SuperAdminLayout from './src/layouts/SuperAdminLayout';
import './src/index.css';
const store=legacy_createStore(()=>({admin:{notification:[]},user:{},superadminTheme:{mode:'light'}}));
const role=new URLSearchParams(location.search).get('panel')==='admin'?'admin':'s-admin';
function Content(){const loc=useLocation();return <section><h1>Isolated sidebar UI check</h1><p>No backend data or login session used.</p><p data-testid="route">{loc.pathname}</p></section>;}
createRoot(document.getElementById('root')).render(<Provider store={store}><ThemeProvider defaultMode="light"><MemoryRouter initialEntries={['/'+role+'/dashboard']}><Routes><Route path="/admin" element={<AdminLayout/>}><Route path="*" element={<Content/>}/></Route><Route path="/s-admin" element={<SuperAdminLayout/>}><Route path="*" element={<Content/>}/></Route></Routes></MemoryRouter></ThemeProvider></Provider>);
