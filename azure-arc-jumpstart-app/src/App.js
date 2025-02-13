import React, { useEffect, useState } from 'react';
import './App.css';
import NavBar from './components/navigation/NavBar';
import BreadcrumbBar from './components/navigation/breadcrumbs/BreadcrumbBar';
import MenuDrawer from './components/navigation/menu/MenuDrawer';
import Dropdown from './components/navigation/dropdown/Dropdown';
import { SideMenu } from './components/navigation/sidemenu/SideMenu';
import Doc from './components/Doc';

const App = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [sideMenuItems, setSideMenuItems] = useState([]);
  const [markdownFileContents, setMarkdownFileContents] = useState('');
  const [markdownFilePath, setMarkdownFilePath] = useState('');

  useEffect(() => {
    const fetchMenuDrawerData = async () => {
      const response = await fetch('./menu-drawer.json');
      const menuItems = await response.json();
      setMenuItems(menuItems);
    };

    const fetchSideMenuData = async () => {
      const response = await fetch('./side-menu.json');
      const data = await response.json();
      const sideMenuItems = data.hasOwnProperty('children') && data.children.length > 0 ? data.children : [];
      setSideMenuItems(sideMenuItems);
    };

    fetchMenuDrawerData();
    fetchSideMenuData();
  }, []);

  const removeFrontmatter = (text) => {
    const frontmatterPattern = /^---\s*[\s\S]*?---\s*/;
    const textWithoutFrontmatter = text.replace(frontmatterPattern, '');

    return textWithoutFrontmatter;
  }

  const handleFileFetch = (pagePath) => {
    const pagePathSplit = pagePath.split('#');
    setMarkdownFilePath(pagePathSplit);
    getDoc(pagePathSplit);
  }

  const getDoc = async (path) => {
    try {
      const pathWithForwardSlashes = path[0].replace(/\\/g, '/');
      let fullPath = path[0] === '' ? './docs/_index.md' : `./docs/${pathWithForwardSlashes}/_index.md`;
      if (path.length > 1) {
        fullPath = `${fullPath}#${path[1]}`;
      }
      const res = await fetch(fullPath);
      const doc = await res.text();
      const htmlText = removeFrontmatter(doc);
      setMarkdownFileContents(htmlText);
    } catch (e) {
      console.log(e);
    }
  }

  const onChange = (e) => {
    const hash = e.target.value;
    const targetElement = document.getElementById(hash);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const gatherElementIds = () => {
    const elementIds = [];

    // Use querySelectorAll to select elements with IDs
    const elementsWithIds = document.querySelectorAll('[id]');

    elementsWithIds.forEach((element) => {
      if (element.id !== 'root') {
        elementIds.push(element.id);
      }
    });

    // if (this.selectRef.current) {
    //   const select = this.selectRef.current;
    //   select.innerHTML = '';
    //   elementIds.forEach((id) => {
    //     const option = document.createElement('option');
    //     option.value = id;
    //     option.text = id;
    //     select.appendChild(option);
    //   });
    // }
  };

  return (
    <>
      <NavBar
        menuItems={menuItems}
        selectedMenuItem={selectedMenuItem}
        setSelectedMenuItem={setSelectedMenuItem}
      />
      <span style={{ position: 'absolute', top: '96px', left: '0px' }}>
        {
          sideMenuItems && sideMenuItems.length > 0 && (
            <SideMenu
              sideMenuItems={sideMenuItems}
              handleFileFetch={handleFileFetch}
            />
          )
        }
      </span>
      {
        selectedMenuItem ? (
          <MenuDrawer
            menuItem={selectedMenuItem}
          />
        ) : (
          <>
            <BreadcrumbBar
              path={markdownFilePath}
              handleFileFetch={handleFileFetch}
            />
            <span style={{ position: 'absolute', top: '48px', right: '71px' }}>
              <Dropdown>Jump to section</Dropdown>
            </span>
          </>
        )
      }
      <span
        style={{
          position: 'absolute',
          top: '96px',
          left: '300px',
          right: '0px',
          color: 'white',
          zIndex: '-1'
        }}>
        <Doc
          doc={markdownFileContents}
          path={markdownFilePath}
          handleFileFetch={handleFileFetch}
          gatherElementIds={gatherElementIds}
        />
      </span>
    </>
  );
}

export default App;
