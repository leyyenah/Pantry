'use client'
import Image from "next/image";
import { useState, useEffect} from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";
import { async } from "@firebase/util";
import { textAlign } from "@mui/system";

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState([false])
  const [itemName, setItemName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const updateInventory = async () => {
    const snapshot = query(collection(firestore,"inventory"))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),  
      })
    })
    setInventory(inventoryList)
  }   

  const addItem = async (item) =>{
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)
    
    if(docSnap.exists()){
      const{quantity} = docSnap.data()
        await setDoc(docRef, {quantity: quantity + 1})
    }
    else{
      await setDoc(docRef, {quantity: 1})
   }
    await updateInventory()
  }

  const removeItem = async (item) =>{
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)
    
    if(docSnap.exists()){
      const{quantity} = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const filteredInventory = inventory.filter((item) =>
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )
  return (
    <Box 
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column" // Makes the buttons up and down instead of side by side
      justifyContent="center"
      alignItems="center"
      gap={2}
      >
      <Modal
      open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top= "50%"
          left= "50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform:"translate(-50%,-50%)"
          }}
        >
          <Typography variant="h6" style={{ color: "#098765", textAlign: "center"}}>{/* Changes text color*/}Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e)=>{
              setItemName(e.target.value)
            }}
            />
            <Button 
              variant="outlined" 
              onClick={()=>{
                addItem(itemName)
                setItemName("")
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button
        variant="contained"
        onClick={() => handleOpen()}
        style={{ backgroundColor: "#96a8a7" }} // Changes the background color
      >
        Add New Item
      </Button>
      <TextField
              label="Search Pantry"
              variant="outlined"
              size="small"
              value={searchQuery}
        
      
              onChange={(e) => setSearchQuery(e.target.value)}
            />
      <Box border="1px solid #333">
        <Box
          width = "800px"
          height = "100px"
          bgcolor="#96a8a7" // Changes Inventory Items background color
          display="flex"
          alignItems="center"
          justifyContent="center">
            <Typography variant = "h2" color = "#FFFFFF">{/* Changes text color*/}
              Pantry Items
            </Typography>
        </Box>

      <Stack width="800px" height="300px" spacing={2} overflow="auto">
        {
          filteredInventory.map(({name, quantity})=>(
            <Box 
            key={name} 
            width="100%" 
            minHeight="150px" 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between"
            bgColor="#f0f0f0"
            padding={5}
            >
              {/* Changes item text color */}
              <Typography variant="h3" color = "#000000" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              {/* Changes quantity text color */}
              <Typography variant="h3" color = "#000" textAlign="center">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={() => addItem(name)}
                style={{ backgroundColor: "#96a8a7" }} // Changes the background color
              > Add </Button>
              <Button variant="contained" onClick={() => removeItem(name)}
                style={{ backgroundColor: "#96a8a7" }} // Changes the background color
              > Remove </Button>
              </Stack>
            </Box>
          ))}
      </Stack>
      </Box>
    </Box>
  )
}