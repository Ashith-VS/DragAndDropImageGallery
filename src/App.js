import React, { useEffect, useState } from 'react';
import './App.css';
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { storage } from './services/firebase';
import {v4 as uuid} from "uuid"
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import addIcon from "./assets/images/plus_icon.png"
import deleteIcon from "./assets/images/delete_icon.png"
import ReactModal from 'react-modal';

const App = () => {
  const [imageList, setImageList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const fetchImages = () => {
    const imageListRef = ref(storage, "images");
    listAll(imageListRef).then((response) => {
      const promises = response.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return { url, path: item.fullPath };
      });
      Promise.all(promises).then((urls) => {
        setImageList(urls);
      });
    });
  };
  
  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = (files) => {
    if (files && files.length > 0) {
      const uploadTasks = Array.from(files).map((file) => {
        const imageName = `${file.name}_${uuid()}`; // Generate a unique image name using UUID
        const imageRef = ref(storage, `images/${imageName}`);
        return uploadBytes(imageRef, file).then(() => {
          console.log(`Image ${imageName} uploaded successfully`);
        });
      });
      Promise.all(uploadTasks).then(() => {
        fetchImages(); 
        toast.success('Images uploaded successfully');
      }).catch((error) => {
        console.error('Error uploading images:', error);
      });
    }
  };

  const handleDeleteImage = async(path) => {
    const imageRef = ref(storage, path);
    try {
      await deleteObject(imageRef);
      fetchImages(); // Refresh image list after deletion
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

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
      // // splice(start,deletecount,itemadd)
      // const draggedImage= newImages.splice(draggedIndex, 1); // Remove the dragged image
      // newImages.splice(dropIndex,0, draggedImage); // Insert the dragged image at the new position

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
          <img src={image?.url} alt="img" className="gallery-image"  onClick={()=>handleModal(image.url)}/>
          <div> <img src={deleteIcon} alt="" className='delete_btn' onClick={()=>handleDeleteImage(image?.path)}/></div>
         
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
    position="top-center"
    autoClose={5000}
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
  </div>
  );
};

export default App;

