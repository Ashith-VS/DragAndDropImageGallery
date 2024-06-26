import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [images, setImages] = useState([]);

  const handleUpload = (e) => {
    const files = e.target.files;
    if(files){ 
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
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
    if (dropIndex !== null ) {
      const newImages = [...images];
      // splice(start,deletecount,itemadd)
      const draggedImage = newImages.splice(draggedIndex, 1); // Remove the dragged image
      newImages.splice(dropIndex, 0, draggedImage); // Insert the dragged image at the new position
      setImages(newImages);
    }
  };

  return (
    <div className="app">
    <h1>Drag and Drop Gallery</h1>
    <label htmlFor="upload-input" className="upload-label">Upload Images</label>
      <input
        type="file"
        id="upload-input"
        multiple
        onChange={handleUpload}
        className="upload-input"
      />
    <div className="gallery">
      {images.map((image, i) => (
        <div
          key={i}
          className="gallery-item"
          draggable
          onDragStart={(e) => handleDragStart(e, i)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, i)}
        >
          <img src={image} alt="img" className="gallery-image" />
          <button className="delete-button" onClick={() => setImages(images.filter((_, index) => index !== i))}>X</button>
        </div>
      ))}
    </div>
  </div>
  );
};

export default App;
