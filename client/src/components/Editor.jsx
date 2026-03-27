import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image'
import Link from '@editorjs/link'
import Checklist from '@editorjs/checklist'
import Embed from '@editorjs/embed'
import React, { useEffect, useRef } from 'react';
import "./Editor.css"
import { Scrollbar } from 'smooth-scrollbar-react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { db, storage } from "../Firebase"
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const Editor = React.forwardRef((props, ref) => {
  const editorInstance = useRef(null);
  const editorContainerRef = useRef(null);
  const { currentUser } = useAuth();
  const date = useParams();

  // Refs so the EditorJS uploader (initialised once) always sees the latest values.
  const dateRef = useRef(date);
  const userRef = useRef(currentUser);
  useEffect(() => { dateRef.current = date; }, [date]);
  useEffect(() => { userRef.current = currentUser; }, [currentUser]);

  // Upload an image file directly to Firebase Storage and return the download URL.
  // Using a ref wrapper so EditorJS (initialised with [] deps) always calls the latest version.
  const uploadImageRef = useRef(null);
  uploadImageRef.current = async (file) => {
    const uid = userRef.current.uid;
    const currentDate = dateRef.current.date;
    const safeName = file.name.replace(/[^a-zA-Z0-9-_.]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const fileRef = storageRef(storage, `Users/${uid}/${currentDate}/Images/${filename}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return { success: 1, file: { url } };
  };

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
            uploader: {
              uploadByFile: (file) => uploadImageRef.current(file),
            },
          },
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
    const documentPath = `Users/${uid}/UserEntries/${date.date}`;
    try {
      const outputData = await editorInstance.current.save();
      await setDoc(doc(db, documentPath), { outputData })
    } catch (e) {
      console.error('Saving failed: ', e);
    }
  };

  const loadData = async () => {
    const uid = currentUser.uid;
    const docRef = doc(db, `Users/${uid}/UserEntries`, `${date.date}`)
    const entry = await getDoc(docRef);
    if (entry.exists()) {
      journal_entry_data = entry.data().outputData;
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
            "id": "doesnt matter",
            "type": "header",
            "data": {
              "text": formatted_date,
              "level": 2
            }
          }]
      }
    }
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
