import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {store} from './redux/store.js'
import './index.css'
import App from './App.jsx'
import CartStorage from './components/CartStorage.jsx'
import WishlistStorage from './components/WishlistStorage.jsx'
const queryClient=new QueryClient()
createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
         <CartStorage/>
     <WishlistStorage/>
      
    <App />
     </QueryClientProvider>
   
    </Provider>
   
  </StrictMode>,
)
