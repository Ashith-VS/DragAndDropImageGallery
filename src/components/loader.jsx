import React from "react";
const Loader = ({loading}) => {
    console.log('isLoading: ', loading);
    
  return (
    <>
      {loading && (
        <div className="loader-container">
          <div className="loader-inner" id="loaderContainer" tabIndex={0}>
            <div className="spinner"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;