import Image from "next/image"
import { Divider, Modal, TextField } from "@mui/material"
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import ClearIcon from '@mui/icons-material/Clear';
import { useState } from "react"
import { ResetTvOutlined } from "@mui/icons-material";
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  // width: 600,
  bgcolor: 'cornsilk',
  border: '1px solid #000',
  boxShadow: 24,
  p: 4,
};
const Search = styled('div')(({ theme }) => ({
  // position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));
const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    backgroundColor: 'white',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));
export default function Home({ esFeeds }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [searchText, setSearchText] = useState(null);
  const [data, setData] = useState(esFeeds);
  console.log("Initiate Data : ", data)
  const handleOpen = (feed) => {
    setShowModal(true);
    setSelectedFeed(feed)
  };
  const handleClose = () => {
    setShowModal(false);
    setSelectedFeed(null)
  };
  const handleSearch = () => {
    let filterText = searchText;
    console.log("text : ", filterText)
    let filteredData = [];
    if (filterText == null || filterText == undefined) {
      setData(esFeeds);
      return;
    }
    esFeeds.forEach(esFeed => {
      if (esFeed.title.toLowerCase().includes(filterText.toLowerCase())) {
        filteredData.push(esFeed);
      }
    })
    setData(filteredData);
    return;
  }
  const onReset = () => {
    setData(esFeeds);
    setSearchText(null)
  }

  return <>
    <div key={"hello"} style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
      <TextField id='search' label='Search' variant="outlined" placeholder="Search"
        value={searchText}
        onChange={(v) => {
          console.log(v)
          setSearchText(v.target.value)
        }}
      />
      <Button onClick={() => { handleSearch() }}><SearchIcon /></Button>
      <Button onClick={() => { onReset() }}><ClearIcon /></Button>
    </div>
    <div style={{ margin: '0 auto', width: '100%' }}>
      {
        data && data.length > 0 && data.map(feed => {
          return (<>
            <div key={feed.title} style={{
              overflowWrap: 'initial', display: 'flex',
              gap: '20px', cursor: 'pointer',
              margin: '20px 20px 20px 20px'
            }}
              onClick={() => { window.open(feed.link, '_blank') }}>
              <div >
                <Image src={feed.img} alt="es-img" height={300} width={300} />
              </div>
              <div><h1 >{feed.title}</h1>
                <p style={{ color: 'green', fontWeight: 'bold' }}>Author : </p><h3>{feed.creator}</h3>
                <p style={{ color: 'green', fontWeight: 'bold' }}>Category : </p> <h3> {feed.category.join(", ")}</h3>
              </div>
            </div>
            <Divider color='black' />

          </>
          )
        })
      }
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showModal}
        onClose={handleClose}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={showModal}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              {selectedFeed?.link}
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </div>
  </>
}

export async function getStaticProps() {
  const response = await fetch('https://www.essentiallysports.com/feed/', {
    method: 'GET',
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  })
  const data = await response.text();
  let feedData = null;
  let blogData = [];
  let xmlParser = require('xml2json');

  let dataJson = JSON.parse(xmlParser.toJson(data))

  feedData = dataJson.rss.channel.item
  feedData.forEach(feed => {
    blogData.push({
      title: feed.title,
      link: feed.link,
      img: feed['media:content'].url,
      creator: feed['dc:creator'] != null ? feed['dc:creator'] : null,
      category: feed.category,
      description: feed.description
    })
  });
  // console.log("results", blogData);
  return {
    props: {
      esFeeds: blogData,
    },
  };
}