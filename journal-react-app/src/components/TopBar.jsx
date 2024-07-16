import "./TopBar.css"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const TopBar = () => {
    let text = "";
    const navigate = useNavigate();
  
    const handleDateChange = (newValue) => {
      const formattedDate = newValue.format('YYYY-MM-DD');
      navigate(`/editor/${formattedDate}`);
    };
  
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div class="topbar-container">
            <div class="logo-container">
                <img src="/images/inJournally_logo.png" alt="Logo" class="logo"></img>
            </div>
            <div class="datepicker-container">
                <DatePicker defaultValue={dayjs()} format="LL" onChange={handleDateChange}/>
            </div>
        </div>
      </LocalizationProvider>
    );
  };

export default TopBar