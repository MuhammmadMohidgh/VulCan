// Background service worker for VulCan extension

// Message types
interface Message {
  type: string;
  data?: any;
}

// Install event
chrome.runtime.onInstalled.addListener(() => {
  console.log('VulCan extension installed');
  
  // Create context menus
  chrome.contextMenus.create({
    id: 'scan-page',
    title: 'Scan this page with VulCan',
    contexts: ['page', 'frame'],
  });

  chrome.contextMenus.create({
    id: 'scan-link',
    title: 'Scan this link with VulCan',
    contexts: ['link'],
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  let targetUrl = '';

  if (info.menuItemId === 'scan-page') {
    targetUrl = info.pageUrl || tab?.url || '';
  } else if (info.menuItemId === 'scan-link') {
    targetUrl = info.linkUrl || '';
  }

  if (targetUrl) {
    try {
      // Open popup and initiate scan
      chrome.action.openPopup();
      
      // Send message to popup to start scan
      chrome.runtime.sendMessage({
        type: 'CONTEXT_SCAN',
        data: { url: targetUrl },
      });
    } catch (error) {
      console.error('Context menu scan failed:', error);
    }
  }
});

// Message listener for communication with popup
chrome.runtime.onMessage.addListener((message: Message, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === 'GET_CURRENT_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      sendResponse({ url: tabs[0]?.url || '' });
    });
    return true; // Required for async response
  }

  if (message.type === 'OPEN_FULL_REPORT') {
    const { scanId } = message.data;
    chrome.tabs.create({
      url: `http://localhost:5173/results?scan=${scanId}`,
    });
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'UPDATE_BADGE') {
    const { text, color } = message.data;
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
    sendResponse({ success: true });
    return true;
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  // Popup will open automatically (defined in manifest.json)
});

console.log('VulCan background service worker initialized');
