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
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const Editor = React.forwardRef((props, ref) => {
  const editorInstance = useRef(null);
  const editorContainerRef = useRef(null);
  const { currentUser } = useAuth();
  const date = useParams();

  // TODO check if data already exists for the date
  let journal_entry_data = {
    "blocks": [
      {
          "id": "oUq2g_tl8y",
          "type": "header",
          "data": {
            "text": "Editor.js",
            "level": 2
          }
      },
      {
          "id": "AOulAjL8XM",
          "type": "header",
          "data": {
            "text": "What does it mean «block-styled editor»",
            "level": 3
          }
      },
      {
          "id": "cyZjplMOZ0",
          "type": "paragraph",
          "data": {
            "text": "Workspace in classic editors is made of a single contenteditable element, used to create different HTML markups. Editor.js <mark class=\"cdx-marker\">workspace consists of separate Blocks: paragraphs, headings, images, lists, quotes, etc</mark>. Each of them is an independent contenteditable element (or more complex structure) provided by Plugin and united by Editor's Core."
          }
      }
    ],
  }

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
              byFile: 'http://localhost:3000/api/upload',
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

  const handleSave = async () => {
    const uid = currentUser.uid;
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
    // const payload = {
    //   userId: uid,
    //   date: date.date,
    //   imageUrls: imageUrls,
    // };

    try {
      const response = await fetch('http://localhost:3000/api/uploadToFirebase', {
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
    console.log("pass");
    // journal_entry_data = {"blocks" : []}
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