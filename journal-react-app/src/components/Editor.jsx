import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image'
import Link from '@editorjs/link'
import Checklist from '@editorjs/checklist'
import Embed from '@editorjs/embed'
import React, { useEffect, useRef, useContext } from 'react';
import "./Editor.css"
import {Scrollbar} from 'smooth-scrollbar-react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { db } from "../Firebase"
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Editor = React.forwardRef((props, ref) => {
  const editorInstance = useRef(null);
  const editorContainerRef = useRef(null);
  const { currentUser } = useAuth();
  const date = useParams();

  // TODO check if data already exists for the date
  let journal_entry_data = {}

  useEffect(() => {
    if (!editorContainerRef.current) return;

    editorInstance.current = new EditorJS({
      holder: editorContainerRef.current,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        image: {
          class: ImageTool,
          inlineToolbar: true,
          config: {
            endpoints: {
              byFile: `${API_BASE_URL}/api/upload`,
            }
          }
        },
        link: {
          class: Link,
          inlineToolbar: true,
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        embed: {
          class: Embed,
          inlineToolbar: true,
        }
      },
      data: journal_entry_data
    });

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    loadData();
  }, [])

  const handleSave = async () => {
    const uid = currentUser.uid;
    console.log(uid)
    let imageUrls = [];
    const documentPath = `Users/${uid}/UserEntries/${date.date}`;
    try {
      const outputData = await editorInstance.current.save();
      outputData.blocks.forEach(block => {
        if (block.type == "image") {
          imageUrls.push(block.data.file.url)
        }
      });
      console.log('Article data: ', outputData);
      await setDoc(doc(db, documentPath), { outputData })
      console.log("it worked yay")
    } catch (e) {
      console.error('Saving failed: ', e);
    }
    
    // for saving images
    const formData = new FormData();
    formData.append('userId', uid);
    formData.append('date', date.date);
    formData.append('imageUrls', JSON.stringify(imageUrls))

    try {
      const response = await fetch(`${API_BASE_URL}/api/uploadToFirebase`, {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (result.success) {
        console.log('Files uploaded to Firebase Storage successfully.');
      } else {
        console.error('Failed to upload files.');
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
    }
  };

  const loadData = async () => {
    const uid = currentUser.uid;
    let imageUrls = []
    const docRef = doc(db, `Users/${uid}/UserEntries`, `${date.date}`)
    const entry = await getDoc(docRef);
    if (entry.exists()) {
      journal_entry_data = entry.data().outputData;
      console.log(journal_entry_data)
      journal_entry_data.blocks.forEach(block => {
        if (block.type == "image") {
          imageUrls.push(block.data.file.url)
          console.log(imageUrls)
        }
      });
    } else {
      const date_object = dayjs(date.date)
      const day_number = date_object.format('D')
      var day_number_place = 'th'
      if (day_number == 1 || day_number == 21 || day_number == 31) {
        day_number_place = 'st'
      } else if (day_number == 2 || day_number == 22) {
        day_number_place = 'nd'
      } else if (day_number == 3 || day_number == 23) {
        day_number_place = 'rd'
      }
      const formatted_date = date_object.format('dddd D') + day_number_place + " " + date_object.format('MMMM YYYY')
      journal_entry_data = {
        "blocks": [
          {
              "id": "doesnt matterrrr",
              "type": "header",
              "data": {
                "text": formatted_date,
                "level": 2
              }
          }]
      }
    }

    if (imageUrls.length > 0) {
      const formData = new FormData();
      formData.append('userId', uid);
      formData.append('date', date.date);
      formData.append('imageUrls', JSON.stringify(imageUrls))
      console.log(uid)
      console.log(date.date)
      console.log(JSON.stringify(imageUrls))
      console.log(formData)
      try {
        const response = await fetch(`${API_BASE_URL}/api/getImagesFromFirebase`, {  // EDIT URL
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
    
        // if (result.success) {
        //   console.log('images retrieved successfully.');
        // } else {
        //   console.error('Failed to get images');
        // }
      } catch (error) {
        console.error('Error in load data:', error);
      }
    }
    console.log(journal_entry_data)
    editorInstance.current.render(journal_entry_data);
  }

  React.useImperativeHandle(ref, () => ({
    handleSave,
    loadData,
  }))

  return (
    <div class="outer-editor-container">
      <Scrollbar>
        <div className="inner-editor-container">
          <button onClick={handleSave} class="save-button">Save</button>
          <div ref={editorContainerRef} ></div>
        </div>
      </Scrollbar>
    </div>
  );
});
  
export default Editor