import React, { useEffect, useState } from 'react';
import './App.css';
import {getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './services/firebase';
import {v4 as uuid} from "uuid"
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import addIcon from "./assets/images/plus_icon.png"
import deleteIcon from "./assets/images/delete_icon.png"
import ReactModal from 'react-modal';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import Loader from './components/loader';

const App = () => {
  const [imageList, setImageList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const imageCollectionRef=collection(db,"images")
  const [isLoading, setIsLoading] = useState(false);
 
  const fetchImages = async() => {
    setIsLoading(true);
    try {
      const q = query(imageCollectionRef, orderBy('timestamp', 'desc'));
      const response = await getDocs(q);
      const urls = response.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setImageList(urls);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Error fetching images');
    }finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchImages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (files) => {
    if (files && files.length > 0) {
      const uploadTasks = Array.from(files).map(async(file) =>{
        const imageName = `${file.name}_${uuid()}`; // Generate a unique image name using UUID
        const imageRef = ref(storage, `images/${imageName}`)
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        await addDoc(imageCollectionRef, { url, path: imageRef.fullPath , timestamp: new Date() });
      });
      setIsLoading(true)

      Promise.all(uploadTasks).then(() => {
        fetchImages(); 
        toast.success('Images uploaded successfully');
        document.getElementById('upload-input').value = ''; // Clear the input value when each successful update
        setIsLoading(false)
      }).catch((error) => {
        console.error('Error uploading images:', error);
        toast.error('Error uploading images');
        setIsLoading(false)
      });
    }
  };

  const handleDeleteImage = async (image) => {
    try {
      setIsLoading(true)
      await deleteDoc(doc(db, 'images', image.id));
      fetchImages(); // Refresh image list after deletion
      toast.success('Image deleted successfully');
      setIsLoading(false)
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error deleting image');
      setIsLoading(false)
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('draggedIndex', index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('draggedIndex');
    if (dropIndex !== null && draggedIndex !== dropIndex){
      const newImages = [...imageList];
        // Swap the positions of the dragged image index and the drop image index
        [newImages[draggedIndex], newImages[dropIndex]] = [newImages[dropIndex], newImages[draggedIndex]];
      setImageList(newImages);
    }
  };

  const handleFileDrop = (e)=>{
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };
 
  const handleModal=(url)=>{
   setSelectedImage(url)
    setIsModalOpen(true)
  }

  const handleClearFile=()=>{
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <div className="app">
     
    <h1>Drag and Drop Gallery</h1>
       <div
        className="drop-area"
        onDragOver={handleDragOver}
        onDrop={handleFileDrop}
      >
        Drag and drop files here to upload
      </div>
      <label htmlFor="upload-input" className="upload-label">Upload Images</label>
      <input
        type="file"
        id="upload-input"
        multiple
        onChange={(e)=>handleUpload(e.target.files)}
        className="upload-input"
        accept="image/*"  // Accept all image formats
      />
    <div className="gallery">
      {imageList.map((image, i) => (
        <div
          key={i}
          className="gallery-item "
          draggable
          onDragStart={(e) => handleDragStart(e, i)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, i)}
        >
        {console.log('imageList: ', imageList)}

          <img src={image?.url} alt="img" className="gallery-image"  onClick={()=>handleModal(image.url)}/>
          <div> <img src={deleteIcon} alt="" className='delete_btn' onClick={()=>handleDeleteImage(image)}/></div>
        </div>
      ))}
       <div
          className="gallery-items"
          onDragOver={handleDragOver}
          onDrop={handleFileDrop}
          style={{color:'gray', display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}
        >
          <h4 className='file-upload'> Drag and drop files here to upload</h4>
      <div style={{width:'100%', display:'flex',justifyContent:'center', alignItems:'center'}}>
          <input
        type="file"
        id="upload-input"
        multiple
        onChange={(e)=>handleUpload(e.target.files)}
        className="upload-input"
        accept="image/*"  // Accept all image formats
      /> 
         <label htmlFor="upload-input">
          <img src={addIcon} alt="upload_img" className='upload_img' />
          </label>
      </div>
        </div>
    </div>
    <ReactModal
      style={customStyles}
      isOpen={isModalOpen}
      onRequestClose={handleClearFile}>
      <img src={selectedImage} alt="img" className='selected-img'/>
      </ReactModal>
    <ToastContainer 
    position="top-right"
    autoClose={2000}
    hideProgressBar
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="dark"
    transition={Slide}
/>
<Loader loading={isLoading}/>
  </div>
  );
};
export default App;

