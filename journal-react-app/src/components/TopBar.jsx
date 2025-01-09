import "./TopBar.css"
import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const TopBar = ({handleSaveOnDateChange}) => {
    const navigate = useNavigate();
    const [date, setDate] = useState(null);
  
    useEffect(() => {
      const storedDate = localStorage.getItem('selectedDate');
      if (storedDate) {
        setDate(dayjs(storedDate));
      } else {
        setDate(dayjs());
      }
    }, []);

    const handleDateChange = (newValue) => {
      handleSaveOnDateChange();
      setDate(newValue);
      const formattedDate = newValue.format('YYYY-MM-DD');
      localStorage.setItem('selectedDate', formattedDate);
      navigate(`/editor/${formattedDate}`);
    };

    const backOneDay = () => {
      const dayBefore = date.subtract(1, 'day')
      handleDateChange(dayBefore);
    }

    const forwardOneDay = () => {
      const dayAfter = date.add(1, 'day')
      handleDateChange(dayAfter)
    }
  
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div class="topbar-container">
            <div class="logo-container">
                <img src="/images/inJournally_logo.png" alt="Logo" className="logo"></img>
            </div>
            <div class="datepicker-container">
                <button class="forward-back-date-change" onClick={backOneDay}><img src="/images/backward.svg" alt="one day before button" className="forward-back-date-icon" /></button>
                <DatePicker value={date} format="LL" onChange={handleDateChange} slotProps={{ textField: { size: 'small' } }}/>
                <button class="forward-back-date-change" onClick={forwardOneDay}><img src="/images/forward.svg" alt="one day after button" className="forward-back-date-icon" /></button>
            </div>
        </div>
      </LocalizationProvider>
    );
  };

export default TopBar