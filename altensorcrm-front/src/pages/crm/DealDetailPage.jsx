import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dealsApi, orgsApi, contactsApi, productsApi, dealProductsApi, taskManagementApi, getCurrentUser, usersApi, notesApi, callLogsApi } from '../../services/api';
import { formatAppDate } from '../../utils/dateUtils';
import { useLanguage } from '../../context/LanguageContext';
import { getDealStatusLabel } from '../../utils/statusUtils';
import TaskWidget from '../../components/crm/TaskWidget';
import EmailWidget from '../../components/crm/EmailWidget';
import AttachmentWidget from '../../components/crm/AttachmentWidget';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  LinkIcon,
  PaperClipIcon,
  TrashIcon,
  CheckIcon,
  ListBulletIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
  ComputerDesktopIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const dealStatusList = [
  { name: 'Qualification', color: '#71717A' },
  { name: 'Demo/Making', color: '#F97316' },
  { name: 'Proposal/Quotation', color: '#38BDF8' },
  { name: 'Negotiation', color: '#EAB308' },
  { name: 'Ready to Close', color: '#A855F7' },
  { name: 'Won', color: '#10B981' },
  { name: 'Lost', color: '#EF4444' }
];

const initialOwnerList = [
  { name: 'Elvin Muzaffarli', initial: 'E', email: 'elvinmuzaffarli@gmail.com' },
  { name: 'Administrator', initial: 'A', email: 'admin@altensor.io' },
  { name: 'Yusif Hashimov', initial: 'Y', email: 'yusif@altensor.io' }
];


const callTypes = ['Outgoing', 'Incoming'];
const callStatuses = ['Completed', 'Missed', 'Busy', 'Scheduled'];

// REAL WORKING RICH TEXT EDITOR COMPONENT (Matching NotesPage!)
const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    strike: false,
    h1: false
  });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateFormatState();
  };

  const updateFormatState = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      strike: document.queryCommandState('strikeThrough'),
      h1: document.queryCommandValue('formatBlock') === 'h1'
    });
  };

  return (
    <div className="bg-[#141416] border border-[#2C2C2E] rounded-2xl overflow-hidden shadow-inner">
      <div className="p-2 bg-[#18181B] border-b border-[#2C2C2E] space-y-1.5 select-none">
        <div ref={toolbarRef} className="flex items-center gap-1.5 text-[#A1A1AA] text-xs overflow-x-auto custom-scrollbar pb-1">
          <button
            type="button"
            onClick={() => exec('formatBlock', '<p>')}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white font-serif border border-[#3F3F46]/60 cursor-pointer shrink-0"
            title="Normal Text"
          >
            T
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h1>')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-white font-bold text-[11px] cursor-pointer shrink-0 ${activeFormats.h1 ? 'bg-[#2C2C2E] border border-sky-500' : 'hover:bg-[#2C2C2E]'
              }`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => exec('bold')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-white font-bold cursor-pointer shrink-0 ${activeFormats.bold ? 'bg-[#2C2C2E] border border-white/20' : 'hover:bg-[#2C2C2E]'
              }`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-white italic cursor-pointer shrink-0 ${activeFormats.italic ? 'bg-[#2C2C2E] border border-white/20' : 'hover:bg-[#2C2C2E]'
              }`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-white line-through cursor-pointer shrink-0 ${activeFormats.strike ? 'bg-[#2C2C2E] border border-white/20' : 'hover:bg-[#2C2C2E]'
              }`}
            title="Strikethrough"
          >
            S
          </button>
          <div className="w-px h-5 bg-[#2C2C2E] mx-0.5 shrink-0"></div>
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) exec('createLink', url);
            }}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#2C2C2E] rounded-lg text-white cursor-pointer shrink-0"
            title="Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={() => onChange(editorRef.current.innerHTML)}
        onKeyUp={updateFormatState}
        onMouseUp={updateFormatState}
        className="p-3 min-h-[140px] text-xs text-white focus:outline-none leading-relaxed overflow-y-auto max-h-[220px] custom-scrollbar"
      />
    </div>
  );
};

const DealDetailPage = () => {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const [ownerList, setOwnerList] = useState(initialOwnerList);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersApi.getAll();
        const list = Array.isArray(data) ? data : (data?.items || data?.data || []);
        if (Array.isArray(list) && list.length > 0) {
          setOwnerList(list.map(u => ({
            id: u.id,
            name: u.name || u.email || 'User',
            initial: (u.name || u.email || 'U').charAt(0).toUpperCase(),
            email: u.email || ''
          })));
        }
      } catch (err) {
        console.warn('Notice fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Data');

  // Custom Floating Toast Alert State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Popover States
  const [isAssignToOpen, setIsAssignToOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [assignToMe, setAssignToMe] = useState(true);

  const assignRef = useRef(null);
  const statusRef = useRef(null);

  // Task Management Comments & Mention State
  const [dealComments, setDealComments] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlId = window.location.pathname.split('/').pop();
        const cached = localStorage.getItem(`crm_deal_comments_${urlId}`);
        if (cached) return JSON.parse(cached);
      } catch { }
    }
    return [];
  });
  const [newCommentInput, setNewCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [associatedTaskId, setAssociatedTaskId] = useState(null);

  const [mentionUsers, setMentionUsers] = useState([]);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  const findOrCreateDealTask = async (dealId) => {
    try {
      const tasks = await taskManagementApi.getAllTasks();
      const list = Array.isArray(tasks) ? tasks : (tasks?.items || tasks?.data || []);
      let dealTask = list.find(t =>
        (t.title && (t.title.includes(`Deal #${dealId}`) || t.title.includes(`Deal Activity Task #${dealId}`))) ||
        (t.description && t.description.includes(`[DEAL_ID:${dealId}]`))
      );

      if (!dealTask) {
        const currentUser = getCurrentUser();
        dealTask = await taskManagementApi.createTask({
          title: `Deal Activity Task #${dealId}`,
          description: `Activity and Comments for Deal #${dealId} [DEAL_ID:${dealId}]`,
          difficulty: 1,
          status: 0,
          createdByUserId: currentUser?.userId || currentUser?.id || ''
        });
      }
      return dealTask?.id || dealTask?.Id;
    } catch (err) {
      console.warn('Error resolving deal task:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadTaskCommentsAndUsers = async () => {
      try {
        const users = await taskManagementApi.getAllUsers();
        if (Array.isArray(users)) {
          setMentionUsers(users.map(u => ({
            id: u.id || u.Id,
            userName: u.userName || u.name || u.email,
            email: u.email || ''
          })));
        }

        if (id) {
          const targetTaskId = await findOrCreateDealTask(id);
          if (targetTaskId) {
            setAssociatedTaskId(targetTaskId);
            const taskDetail = await taskManagementApi.getTaskById(targetTaskId);
            if (taskDetail && taskDetail.taskComments && Array.isArray(taskDetail.taskComments)) {
              setDealComments(taskDetail.taskComments);
              localStorage.setItem(`crm_deal_comments_${id}`, JSON.stringify(taskDetail.taskComments));
            }
          }
        }
      } catch (err) {
        console.warn('Comments load notice:', err);
      }
    };
    loadTaskCommentsAndUsers();
  }, [id]);

  const handleCommentInputChange = (e) => {
    const val = e.target.value;
    setNewCommentInput(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setShowMentionPopover(true);
        return;
      }
    }
    setShowMentionPopover(false);
  };

  const handleSelectMentionUser = (userName) => {
    const lastAtIndex = newCommentInput.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textBeforeAt = newCommentInput.slice(0, lastAtIndex);
      const updatedText = `${textBeforeAt}@${userName} `;
      setNewCommentInput(updatedText);
    }
    setShowMentionPopover(false);
  };

  const handlePostTaskComment = async (e) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;

    setCommentSubmitting(true);
    try {
      let targetId = associatedTaskId;
      if (!targetId && id) {
        targetId = await findOrCreateDealTask(id);
        setAssociatedTaskId(targetId);
      }

      if (targetId) {
        await taskManagementApi.addComment(targetId, newCommentInput.trim());
        try {
          const taskDetail = await taskManagementApi.getTaskById(targetId);
          if (taskDetail && taskDetail.taskComments && Array.isArray(taskDetail.taskComments)) {
            setDealComments(taskDetail.taskComments);
            localStorage.setItem(`crm_deal_comments_${id}`, JSON.stringify(taskDetail.taskComments));
          } else {
            throw new Error('Manual push');
          }
        } catch {
          const currentUser = getCurrentUser();
          const newCommentObj = {
            id: Date.now(),
            content: newCommentInput.trim(),
            user: { userName: currentUser?.userName || currentUser?.name || 'Administrator', avatarUrl: currentUser?.avatarUrl },
            createAt: new Date().toISOString()
          };
          const updated = [newCommentObj, ...dealComments];
          setDealComments(updated);
          localStorage.setItem(`crm_deal_comments_${id}`, JSON.stringify(updated));
        }
      }
      setNewCommentInput('');
      showToast('Şərh əlavə olundu VƏ bildiriş göndərildi!', 'success');
    } catch (err) {
      showToast('Şərh əlavə edilərkən xəta baş verdi.', 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    organizationName: '',
    website: '',
    annualRevenue: '$ 0.00',
    dealOwner: 'Elvin Muzaffarli',
    status: 'Demo/Making',
    contactName: 'Nermin Veliyeva'
  });


  // Collapsible Section Controls
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isContactsOpen, setIsContactsOpen] = useState(true);
  const [isOrgDetailsOpen, setIsOrgDetailsOpen] = useState(true);

  // Available Products & Table Rows State
  const [availableProducts, setAvailableProducts] = useState(() => {
    const saved = localStorage.getItem('altensor_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(item => item.name !== 'aasas');
      } catch {
        return [];
      }
    }
    return [];
  });

  const [products, setProducts] = useState([]);
  const [selectedProductRowIndexes, setSelectedProductRowIndexes] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [activeProductDropdownRowIndex, setActiveProductDropdownRowIndex] = useState(null);

  const handleToggleSelectAllProducts = (e) => {
    if (e.target.checked) {
      setSelectedProductRowIndexes(products.map((_, idx) => idx));
    } else {
      setSelectedProductRowIndexes([]);
    }
  };

  const handleToggleSelectProductRow = (index) => {
    if (selectedProductRowIndexes.includes(index)) {
      setSelectedProductRowIndexes(selectedProductRowIndexes.filter(i => i !== index));
    } else {
      setSelectedProductRowIndexes([...selectedProductRowIndexes, index]);
    }
  };

  const handleDeleteSelectedProductRows = async () => {
    if (selectedProductRowIndexes.length === 0) return;

    const rowsToDelete = products.filter((_, idx) => selectedProductRowIndexes.includes(idx));

    for (const r of rowsToDelete) {
      const targetId = r.productId || r.id;
      const targetName = r.name;

      if (targetId && typeof targetId === 'string' && targetId.includes('-')) {
        try {
          await productsApi.delete(targetId);
          console.log(`[FRONTEND PRODUCTS] Deleted product ${targetId} from Database`);
        } catch (err) {
          console.warn(`[FRONTEND PRODUCTS] Delete API warning for product ${targetId}:`, err);
        }
      }

      setAvailableProducts(prev => prev.filter(p => p.id !== targetId && p.name !== targetName));

      const savedLocal = localStorage.getItem('altensor_products');
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          const filtered = parsed.filter(p => p.id !== targetId && p.name !== targetName);
          localStorage.setItem('altensor_products', JSON.stringify(filtered));
        } catch { }
      }
    }

    const remaining = products.filter((_, idx) => !selectedProductRowIndexes.includes(idx));
    setProducts(remaining);
    setSelectedProductRowIndexes([]);

    if (id) {
      localStorage.setItem(`altensor_deal_products_${id}`, JSON.stringify(remaining));
    }

    showToast('Selected row(s) deleted!', 'success');
  };
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isNamingSeriesOpen, setIsNamingSeriesOpen] = useState(false);

  const [newProductForm, setNewProductForm] = useState({
    namingSeries: 'CRM-PROD-.YYYY.-',
    productCode: '',
    productName: '',
    disabled: false,
    standardSellingRate: '0.00',
    image: null,
    description: ''
  });

  const handleOpenCreateModal = (rowIndex = null) => {
    setActiveProductDropdownRowIndex(rowIndex);
    setEditingProductId(null);
    setNewProductForm({
      namingSeries: 'CRM-PROD-.YYYY.-',
      productCode: '',
      productName: '',
      disabled: false,
      standardSellingRate: '0.00',
      image: null,
      description: ''
    });
    setIsNewProductModalOpen(true);
  };

  const handleEditProductClick = (rowIndex, p) => {
    setActiveProductDropdownRowIndex(rowIndex);
    const found = availableProducts.find(item => item.id === p.productId || item.name === p.name);

    setEditingProductId(found?.id || p.productId || null);
    setNewProductForm({
      namingSeries: found?.namingSeries || 'CRM-PROD-.YYYY.-',
      productCode: found?.code || p.code || '',
      productName: found?.name || p.name || '',
      disabled: found?.disabled || false,
      standardSellingRate: String(found?.rate ?? p.rate ?? '0.00'),
      image: found?.image || null,
      description: found?.description || ''
    });
    setIsNewProductModalOpen(true);
  };

  // Attach Modal State
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [attachTab, setAttachTab] = useState('device'); // 'device' | 'link' | 'camera'
  const [selectedAttachFile, setSelectedAttachFile] = useState(null);
  const [attachLinkUrl, setAttachLinkUrl] = useState('');
  const [uploadingAttach, setUploadingAttach] = useState(false);

  const handleConfirmAttach = async () => {
    if (attachTab === 'link' && attachLinkUrl) {
      setNewProductForm({ ...newProductForm, image: attachLinkUrl });
      setIsAttachModalOpen(false);
      setAttachLinkUrl('');
      showToast('Image URL attached!', 'success');
      return;
    }

    if (selectedAttachFile) {
      setUploadingAttach(true);
      try {
        const res = await productsApi.uploadImage(selectedAttachFile);
        const fileUrl = res.url || `/uploads/products/${res.fileName || selectedAttachFile.name}`;
        setNewProductForm({ ...newProductForm, image: fileUrl });
        setIsAttachModalOpen(false);
        setSelectedAttachFile(null);
        showToast('Image uploaded & saved to wwwroot!', 'success');
      } catch (err) {
        console.error('Upload error:', err);
        setNewProductForm({ ...newProductForm, image: selectedAttachFile.name });
        setIsAttachModalOpen(false);
        setSelectedAttachFile(null);
        showToast('Image attached!', 'success');
      } finally {
        setUploadingAttach(false);
      }
    }
  };

  const handleAddProductRow = () => {
    setProducts([...products, { id: Date.now(), productId: '', name: '', rate: 0 }]);
  };

  const handleSelectProduct = (rowIndex, prod) => {
    const updated = [...products];
    updated[rowIndex] = {
      ...updated[rowIndex],
      productId: prod.id,
      name: prod.name,
      rate: prod.rate
    };
    setProducts(updated);
    setActiveProductDropdownRowIndex(null);
    setProductSearchQuery('');
  };

  const handleClearProductRow = (rowIndex) => {
    const updated = [...products];
    updated[rowIndex] = {
      ...updated[rowIndex],
      productId: '',
      name: '',
      rate: 0
    };
    setProducts(updated);
    setActiveProductDropdownRowIndex(null);
    setProductSearchQuery('');
  };

  // Load deal's specific table rows from localStorage when deal ID changes
  useEffect(() => {
    if (id) {
      const savedDealProds = localStorage.getItem(`altensor_deal_products_${id}`);
      if (savedDealProds) {
        try {
          setProducts(JSON.parse(savedDealProds));
        } catch {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    }
  }, [id]);

  // Whenever products state changes for this deal, save it
  useEffect(() => {
    if (id && products.length > 0) {
      localStorage.setItem(`altensor_deal_products_${id}`, JSON.stringify(products));
    }
  }, [id, products]);

  const fetchProducts = async () => {
    console.log('[FRONTEND PRODUCTS] Calling productsApi.getAll()...');
    try {
      const list = await productsApi.getAll();
      console.log('[FRONTEND PRODUCTS] API returned products list:', list);
      if (list && Array.isArray(list)) {
        const mapped = list.map(p => ({
          id: p.id,
          name: p.productName || p.productCode,
          code: p.productCode,
          rate: p.standardSellingRate,
          namingSeries: p.namingSeries,
          disabled: p.disabled,
          description: p.description,
          image: p.imageUrl || null
        }));

        const savedLocal = localStorage.getItem('altensor_products');
        let localList = savedLocal ? JSON.parse(savedLocal) : [];
        localList = localList.filter(item => item.name !== 'aasas');

        const combined = [...mapped];
        localList.forEach(lp => {
          if (!combined.some(c => c.id === lp.id || c.code === lp.code)) {
            combined.push(lp);
          }
        });

        console.log('[FRONTEND PRODUCTS] Combined products state:', combined);
        setAvailableProducts(combined);
        localStorage.setItem('altensor_products', JSON.stringify(combined));
      }
    } catch (err) {
      console.error('[FRONTEND PRODUCTS] Error fetching products from API:', err);
      const savedLocal = localStorage.getItem('altensor_products');
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal).filter(item => item.name !== 'aasas');
          setAvailableProducts(parsed);
        } catch { }
      }
    }
  };

  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    const rateVal = parseFloat(newProductForm.standardSellingRate) || 0;
    const prodName = newProductForm.productName || newProductForm.productCode || 'New Product';

    const payload = {
      namingSeries: newProductForm.namingSeries || 'CRM-PROD-.YYYY.-',
      productCode: newProductForm.productCode || ('PROD-' + Date.now().toString().slice(-4)),
      productName: prodName,
      standardSellingRate: rateVal,
      disabled: newProductForm.disabled || false,
      description: newProductForm.description || '',
      imageUrl: newProductForm.image || null
    };

    if (editingProductId) {
      // EDIT / UPDATE EXISTING PRODUCT IN DATABASE
      try {
        const updatePayload = {
          id: editingProductId,
          ...payload
        };
        const updatedRes = await productsApi.update(editingProductId, updatePayload);

        const updatedProdObj = {
          id: editingProductId,
          name: updatedRes?.productName || prodName,
          code: updatedRes?.productCode || payload.productCode,
          rate: updatedRes?.standardSellingRate ?? rateVal,
          namingSeries: updatedRes?.namingSeries || payload.namingSeries,
          disabled: updatedRes?.disabled ?? payload.disabled,
          description: updatedRes?.description || payload.description,
          image: updatedRes?.imageUrl || payload.imageUrl
        };

        const updatedAvailable = availableProducts.map(item => item.id === editingProductId ? updatedProdObj : item);
        setAvailableProducts(updatedAvailable);
        localStorage.setItem('altensor_products', JSON.stringify(updatedAvailable));

        // Update rows in products table that use this product
        setProducts(prev => prev.map(row => (row.productId === editingProductId || row.name === payload.productName) ? {
          ...row,
          name: updatedProdObj.name,
          rate: updatedProdObj.rate
        } : row));

        setIsNewProductModalOpen(false);
        setEditingProductId(null);
        showToast('Product updated successfully in Database!', 'success');
      } catch (err) {
        console.error('[FRONTEND PRODUCTS] Database Update Error:', err);
        showToast(`Database Error: ${err.message || 'Could not update product'}`, 'error');
      }
    } else {
      // CREATE NEW PRODUCT IN DATABASE
      try {
        const created = await productsApi.create(payload);
        console.log('[FRONTEND PRODUCTS] Product CREATED in Database:', created);

        const newProdObj = {
          id: created.id,
          name: created.productName || prodName,
          code: created.productCode || payload.productCode,
          rate: created.standardSellingRate ?? rateVal,
          namingSeries: created.namingSeries || payload.namingSeries,
          disabled: created.disabled ?? false,
          description: created.description || '',
          image: created.imageUrl || newProductForm.image || null
        };

        const updatedAvailable = [newProdObj, ...availableProducts.filter(p => p.id !== newProdObj.id)];
        setAvailableProducts(updatedAvailable);
        localStorage.setItem('altensor_products', JSON.stringify(updatedAvailable));

        if (activeProductDropdownRowIndex !== null && products[activeProductDropdownRowIndex]) {
          handleSelectProduct(activeProductDropdownRowIndex, newProdObj);
        } else {
          const newRow = {
            id: Date.now(),
            productId: newProdObj.id,
            name: newProdObj.name,
            rate: newProdObj.rate
          };
          setProducts(prev => [...prev, newRow]);
        }

        setIsNewProductModalOpen(false);
        showToast('Product saved to Database!', 'success');

        setNewProductForm({
          namingSeries: 'CRM-PROD-.YYYY.-',
          productCode: '',
          productName: '',
          disabled: false,
          standardSellingRate: '0.00',
          image: null,
          description: ''
        });
      } catch (err) {
        console.error('[FRONTEND PRODUCTS] Database Save Error:', err);
        showToast(`Database Error: ${err.message || 'Could not save product'}`, 'error');
      }
    }
  };

  // Real DB Notes & Call Logs State
  const [notesList, setNotesList] = useState([]);
  const [callLogsList, setCallLogsList] = useState([]);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);
  const [openDropdownField, setOpenDropdownField] = useState(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [callForm, setCallForm] = useState({
    type: 'Outgoing',
    receiver: 'Nermin Veliyeva',
    status: 'Completed',
    duration: '30s',
    fromNumber: '0500000000',
    toNumber: '0550000000'
  });

  useEffect(() => {
    fetchProducts();
    if (id) {
      fetchDealDetail(id);
      fetchDealNotesAndCalls();
    }
  }, [id]);

  const fetchDealNotesAndCalls = async () => {
    try {
      const [allNotes, allCalls] = await Promise.all([
        notesApi.getAll().catch(() => []),
        callLogsApi.getAll().catch(() => [])
      ]);

      if (Array.isArray(allNotes)) {
        setNotesList(allNotes);
      }
      if (Array.isArray(allCalls)) {
        setCallLogsList(allCalls);
      }
    } catch (err) {
      console.warn('Notice fetching deal notes/calls:', err);
    }
  };

  const handleCreateNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim() && !noteForm.content.trim()) return;

    const newNote = {
      id: String(Date.now()),
      title: noteForm.title || 'Untitled Note',
      content: noteForm.content || '',
      owner: formData.dealOwner || 'Administrator',
      ownerInitial: (formData.dealOwner || 'A').charAt(0).toUpperCase(),
      lastModified: 'Just now',
      dealId: id
    };

    setNotesList((prev) => [newNote, ...prev]);
    setIsNewNoteModalOpen(false);
    showToast('Note created successfully!', 'success');

    try {
      const payload = {
        title: noteForm.title || 'Untitled Note',
        content: noteForm.content || '',
        createdById: null,
        leadId: null,
        dealId: id
      };
      await notesApi.create(payload);
      await fetchDealNotesAndCalls();
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setNoteForm({ title: '', content: '' });
    }
  };

  const handleCreateCallSubmit = async (e) => {
    e.preventDefault();
    const typeStr = callForm.type === 'Outgoing' ? 'Outgoing' : 'Incoming';
    const durSec = parseInt(String(callForm.duration || '0').replace(/[^0-9]/g, '')) || 0;

    const newCall = {
      id: String(Date.now()),
      caller: formData.dealOwner || 'Administrator',
      callerInitial: (formData.dealOwner || 'A').charAt(0).toUpperCase(),
      receiver: callForm.receiver || formData.contactName || 'Contact',
      receiverInitial: (callForm.receiver || formData.contactName || 'C').charAt(0).toUpperCase(),
      type: typeStr,
      status: callForm.status || 'Completed',
      duration: callForm.duration || '30s',
      fromNumber: callForm.fromNumber || '0500000000',
      toNumber: callForm.toNumber || '0550000000',
      createdOn: 'Just now',
      dealId: id
    };

    setCallLogsList((prev) => [newCall, ...prev]);
    setIsNewCallModalOpen(false);
    showToast('Call logged successfully!', 'success');

    try {
      const payload = {
        type: typeStr,
        toNumber: callForm.toNumber || '0550000000',
        fromNumber: callForm.fromNumber || '0500000000',
        status: callForm.status === 'Completed' ? 0 : callForm.status === 'Missed' ? 1 : 2,
        durationInSeconds: durSec,
        callReceivedById: null,
        callerUserId: null,
        leadId: null,
        dealId: id
      };
      await callLogsApi.create(payload);
      await fetchDealNotesAndCalls();
    } catch (err) {
      console.error('Error saving call log:', err);
    }
  };

  // Click Outside to Close Popovers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (assignRef.current && !assignRef.current.contains(e.target)) {
        setIsAssignToOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDealDetail = async (dealId) => {
    try {
      setLoading(true);
      const data = await dealsApi.getById(dealId);
      if (data) {
        setFormData({
          organizationName: data.organizationName || data.name || '',
          website: data.website || '',
          territory: data.territoryName || '',
          annualRevenue: data.annualRevenue ? `$ ${data.annualRevenue}` : '$ 0.00',
          closedDate: data.closedDate || '',
          probability: '25.000%',
          nextStep: data.nextStep || '',
          dealOwner: data.dealOwnerName || 'Elvin Muzaffarli',
          status: data.statusName || data.status || 'Demo/Making',
          contactName: data.contactName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || '',
          primaryEmail: data.primaryEmail || data.email || ''
        });
      }
    } catch (err) {
      console.warn('Notice fetching deal detail:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (overrideData = null) => {
    const dataToSave = overrideData || formData;
    try {
      setSaving(true);
      const payload = {
        id: id,
        chooseExistingOrganization: true,
        chooseExistingContact: true,
        organizationName: dataToSave.organizationName || 'Company',
        primaryEmail: '',
        primaryMobileNo: '',
        salutation: null,
        firstName: 'Contact',
        lastName: '',
        gender: null,
        website: dataToSave.website || '',
        noOfEmployees: null,
        territoryId: null,
        annualRevenue: parseFloat((dataToSave.annualRevenue || '0').replace(/[^0-9.]/g, '')) || 0,
        industry: null,
        status: dataToSave.status,
        dealOwnerId: null,
        organizationId: null,
        contactId: null
      };

      await dealsApi.update(id, payload);
      showToast('Deal saved successfully!', 'success');
      await fetchDealDetail(id);
    } catch (err) {
      console.error('Error updating deal:', err);
      showToast(err.message || 'Error updating deal', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const updated = { ...formData, status: newStatus };
    setFormData(updated);
    setIsStatusOpen(false);
    try {
      setSaving(true);
      await dealsApi.updateStage(id, newStatus);
      showToast('Deal status updated successfully!', 'success');
      await fetchDealDetail(id);
    } catch (err) {
      console.warn('Fallback to full update for status change:', err.message);
      await handleSave(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDeal = async () => {
    if (!window.confirm(`Are you sure you want to delete deal "${dealTitle}"?`)) return;
    try {
      setSaving(true);
      await dealsApi.delete(id);
      showToast('Deal deleted successfully!', 'success');
      setTimeout(() => {
        navigate('/crm/deals');
      }, 1000);
    } catch (err) {
      console.error('Error deleting deal:', err);
      showToast(err.message || 'Error deleting deal', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignToMeToggle = () => {
    const nextVal = !assignToMe;
    setAssignToMe(nextVal);
    const newOwner = nextVal ? 'Elvin Muzaffarli' : 'Administrator';
    const updated = { ...formData, dealOwner: newOwner };
    setFormData(updated);
    handleSave(updated);
  };

  const ownerObj = ownerList.find(o => o.name === formData.dealOwner) || ownerList[0];
  const activeStatusObj = dealStatusList.find(s => s.name === formData.status) || dealStatusList[1];
  const dealTitle = formData.organizationName || 'Deal Details';

  return (
    <div className="-m-4 lg:-m-6 -mb-20 min-h-screen bg-[#121214] text-[#E4E4E7] flex flex-col font-sans relative">
      {/* FLOATING TOAST ALERT NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center justify-between gap-3 bg-[#E4E4E7] text-[#18181B] px-4 py-2.5 rounded-2xl shadow-2xl min-w-[280px] max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            {toast.type === 'error' ? (
              <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-black shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[#71717A] hover:text-black transition-colors cursor-pointer p-0.5"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP BREADCRUMB & HEADER ACTIONS BAR */}
      <div className="px-6 py-3 border-b border-[#2C2C2E]/60 bg-[#121214] flex items-center justify-between shrink-0">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
          <Link to="/crm/deals" className="hover:text-white transition-colors">{language === 'az' ? 'Sövdələşmələr' : language === 'en' ? 'Deals' : 'Сделки'}</Link>
          <span>/</span>
          <Link to="/crm/deals" className="hover:text-white transition-colors">{language === 'az' ? 'Siyahı' : language === 'en' ? 'List' : 'Список'}</Link>
          <span>/</span>
          <span className="text-white font-semibold">{dealTitle}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 text-xs">
          {/* ASSIGN TO POPOVER */}
          <div className="relative" ref={assignRef}>
            <button
              onClick={() => setIsAssignToOpen(!isAssignToOpen)}
              className="flex items-center gap-2 bg-[#1C1C1E] border border-[#2C2C2E] px-3.5 py-1.5 rounded-xl hover:border-[#3F3F46] transition-colors cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-[#27272A] text-white text-[9px] font-bold flex items-center justify-center">
                {ownerObj.initial}
              </span>
              <span className="font-medium text-white">{formData.dealOwner}</span>
            </button>

            {isAssignToOpen && (
              <div className="absolute top-11 right-0 w-80 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#E4E4E7] space-y-4 animate-in fade-in duration-150">
                <span className="text-sm font-semibold text-white block">{language === 'az' ? 'Təyin et' : language === 'en' ? 'Assign To' : 'Назначить'}</span>

                <div className="bg-[#141416] border border-[#2C2C2E] rounded-xl p-2 flex items-center gap-2 flex-wrap min-h-[44px]">
                  <div className="flex items-center gap-1.5 bg-[#27272A] border border-[#3F3F46] text-white px-2.5 py-1 rounded-lg text-xs font-medium">
                    <span className="w-4 h-4 rounded-full bg-[#3F3F46] text-white text-[9px] font-bold flex items-center justify-center">
                      {ownerObj.initial}
                    </span>
                    <span>{formData.dealOwner}</span>
                    <button onClick={() => { setFormData({ ...formData, dealOwner: 'Administrator' }); }} className="text-[#A1A1AA] hover:text-white ml-1">
                      ×
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#2C2C2E]/60">
                  <span className="font-medium text-white">{language === 'az' ? 'Mənə təyin et' : language === 'en' ? 'Assign To Me' : 'Назначить мне'}</span>
                  <button
                    type="button"
                    onClick={handleAssignToMeToggle}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${assignToMe ? 'bg-sky-600' : 'bg-[#27272A]'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${assignToMe ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STATUS DROPDOWN POPOVER (Screenshot 2 Match!) */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center gap-2.5 bg-[#1C1C1E] border border-[#2C2C2E] px-3.5 py-1.5 rounded-xl font-semibold hover:border-[#3F3F46] transition-colors cursor-pointer"
            >
              <span className="w-3.5 h-3.5 rounded-full border-2 shrink-0" style={{ borderColor: activeStatusObj.color }}></span>
              <span className="text-white">{getDealStatusLabel(formData.status, language)}</span>
              {isStatusOpen ? <ChevronUpIcon className="w-3.5 h-3.5 text-[#A1A1AA]" /> : <ChevronDownIcon className="w-3.5 h-3.5 text-[#A1A1AA]" />}
            </button>

            {isStatusOpen && (
              <div className="absolute top-11 right-0 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                {dealStatusList.map((st) => (
                  <button
                    key={st.name}
                    onClick={() => handleStatusChange(st.name)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${formData.status === st.name ? 'bg-[#2C2C2E] font-semibold text-white' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                      }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border-2 shrink-0" style={{ borderColor: st.color }}></span>
                    <span>{getDealStatusLabel(st.name, language)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUB-HEADER NAVIGATION TABS */}
      <div className="px-6 border-b border-[#2C2C2E]/60 bg-[#121214] flex items-center gap-6 text-xs text-[#A1A1AA] overflow-x-auto custom-scrollbar shrink-0">
        {[
          { key: 'Activity', label: language === 'az' ? 'Fəaliyyət' : language === 'en' ? 'Activity' : 'Активность' },
          { key: 'Emails', label: language === 'az' ? 'E-poçtlar' : language === 'en' ? 'Emails' : 'Письма' },
          { key: 'Comments', label: language === 'az' ? 'Şərhlər' : language === 'en' ? 'Comments' : 'Комментарии' },
          { key: 'Data', label: language === 'az' ? 'Məlumat' : language === 'en' ? 'Data' : 'Данные' },
          { key: 'Calls', label: language === 'az' ? 'Zənglər' : language === 'en' ? 'Calls' : 'Звонки' },
          { key: 'Tasks', label: language === 'az' ? 'Tapşırıqlar' : language === 'en' ? 'Tasks' : 'Задачи' },
          { key: 'Notes', label: language === 'az' ? 'Qeydlər' : language === 'en' ? 'Notes' : 'Заметки' },
          { key: 'Attachments', label: language === 'az' ? 'Əlavələr' : language === 'en' ? 'Attachments' : 'Вложения' }
        ].map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setActiveTab(tabItem.key)}
            className={`py-3 font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${activeTab === tabItem.key
                ? 'border-sky-500 text-white font-semibold'
                : 'border-transparent hover:text-white'
              }`}
          >
            {tabItem.key === 'Data' && <ListBulletIcon className="w-3.5 h-3.5" />}
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* 3. MAIN TWO-COLUMN CONTENT BODY */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* LEFT MAIN PANEL */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-between space-y-6">
          <div className="space-y-6 flex-1">
            {/* 1. ACTIVITY TAB */}
            {activeTab === 'Activity' && (
              <>
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Fəaliyyət' : language === 'en' ? 'Activity' : 'Активность'}</h1>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <span>+ {language === 'az' ? 'Yeni' : language === 'en' ? 'New' : 'Новый'}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <UserGroupIcon className="w-4 h-4 text-[#A1A1AA]" />
                      <span className="font-semibold text-white">Administrator</span>
                      <span className="text-[#A1A1AA]">{language === 'az' ? 'bu sövdələşməni yaratdı' : language === 'en' ? 'created this deal' : 'создал эту сделку'}</span>
                    </div>
                    <span className="text-[11px] text-[#71717A]">{language === 'az' ? 'bayaq' : language === 'en' ? 'just now' : 'только что'}</span>
                  </div>
                </div>
              </>
            )}

            {/* 2. EMAILS TAB */}
            {activeTab === 'Emails' && (
              <EmailWidget
                dealId={id}
                entityName={dealTitle}
                defaultToEmail={formData.primaryEmail || ''}
                referenceCode={`#CRM-DEAL-2026-${(id || '00017').padStart(5, '0')}`}
                onSwitchToComments={() => setActiveTab('Comments')}
              />
            )}

            {/* 3. COMMENTS TAB (EXACT MATCH TO USER SCREENSHOT) */}
            {activeTab === 'Comments' && (
              <div className="space-y-6 flex flex-col justify-between h-full min-h-[500px]">

                {/* Top Header */}
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5 shrink-0">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Şərhlər' : language === 'en' ? 'Comments' : 'Комментарии'}</h1>
                  <button
                    type="button"
                    onClick={() => {
                      const commentBox = document.getElementById('deal-comment-input');
                      if (commentBox) commentBox.focus();
                    }}
                    className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-black px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                  >
                    <span>+ {language === 'az' ? 'Yeni Şərh' : language === 'en' ? 'New Comment' : 'Новый комментарий'}</span>
                  </button>
                </div>

                {/* Timeline & Comments List */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-1 relative">
                  {/* Timeline Vertical Connector Line */}
                  {dealComments.length > 0 && (
                    <div className="w-px bg-[#27272A] absolute left-2.5 top-3 bottom-4 -z-0"></div>
                  )}

                  {dealComments.length === 0 ? (
                    <div className="py-16 text-center text-[#71717A] text-xs">
                      {language === 'az' ? 'Hələ ki şərh yoxdur. Aşağıdakı bölmədən ilk şərhinizi yazın!' : language === 'en' ? 'No comments yet. Write your first comment below!' : 'Комментариев пока нет. Напишите первый комментарий ниже!'}
                    </div>
                  ) : (
                    dealComments.map((c) => {
                      const authorName = c.user?.userName || c.userName || 'Elvin Muzaffarli';
                      const initial = authorName.charAt(0).toUpperCase();
                      const dateStr = c.createAt ? formatAppDate(c.createAt) : 'Just now';
                      return (
                        <div key={c.id || Math.random()} className="space-y-2 relative z-10 pl-8">
                          {/* Timeline Dot & Icon */}
                          <div className="absolute left-0 top-0.5 flex items-center justify-center w-5 h-5 bg-[#141416] text-[#A1A1AA]">
                            <ChatBubbleLeftIcon className="w-4 h-4 stroke-[1.75]" />
                          </div>

                          {/* Comment Header */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {(c.user?.avatarUrl || c.avatarUrl) ? (
                                <img
                                  src={(c.user?.avatarUrl || c.avatarUrl).startsWith('http') ? (c.user?.avatarUrl || c.avatarUrl) : `https://api-crm.altensor.com${c.user?.avatarUrl || c.avatarUrl}`}
                                  alt="Avatar"
                                  className="w-5 h-5 rounded-full object-cover border border-[#3F3F46] shrink-0"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {initial}
                                </div>
                              )}
                              <span className="font-semibold text-white">{authorName}</span>
                              <span className="text-[#A1A1AA]">{language === 'az' ? 'şərh əlavə etdi' : language === 'en' ? 'added a comment' : 'добавил комментарий'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
                              <span>{dateStr}</span>
                              <span className="cursor-pointer hover:text-white">···</span>
                            </div>
                          </div>

                          {/* Comment Body Card (Matching Screenshot!) */}
                          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 text-xs text-[#E4E4E7] font-medium leading-relaxed shadow-sm">
                            {c.content || c.Content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Fixed Comment Editor Card (Matching Screenshot!) */}
                <form onSubmit={handlePostTaskComment} className="bg-[#141416] border border-[#27272A] rounded-2xl p-3 space-y-3 relative shrink-0 shadow-2xl">

                  {/* Tabs Toolbar: Reply & Comment */}
                  <div className="flex items-center gap-2 border-b border-[#27272A]/80 pb-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('Emails')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs text-[#71717A] hover:text-white transition-colors cursor-pointer"
                    >
                      <EnvelopeIcon className="w-3.5 h-3.5" />
                      <span>{language === 'az' ? 'Cavab' : language === 'en' ? 'Reply' : 'Ответить'}</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-[#27272A] border border-[#3F3F46]/60 text-white font-semibold shadow-xs"
                    >
                      <ChatBubbleLeftIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>{language === 'az' ? 'Şərh' : language === 'en' ? 'Comment' : 'Комментарий'}</span>
                    </button>
                  </div>

                  {/* Textarea Input + @ Mention Popover */}
                  <div className="relative">
                    <textarea
                      id="deal-comment-input"
                      rows={3}
                      placeholder={language === 'az' ? 'Şərhinizi daxil edin...' : language === 'en' ? 'Enter a comment...' : 'Введите комментарий...'}
                      value={newCommentInput}
                      onChange={handleCommentInputChange}
                      className="w-full bg-transparent p-2 text-xs text-white placeholder:text-[#52525B] focus:outline-none resize-none"
                    />

                    {/* @ Mention Popover Dropdown (Instagram Style) */}
                    {showMentionPopover && (
                      <div className="absolute left-0 bottom-full mb-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 w-60 max-h-48 overflow-y-auto space-y-0.5 animate-in fade-in duration-100">
                        <div className="px-2.5 py-1 text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                          {language === 'az' ? 'Etiketləmək üçün istifadəçi seçin' : language === 'en' ? 'Select user to mention' : 'Выберите пользователя'}
                        </div>
                        {mentionUsers
                          .filter(u => u.userName.toLowerCase().includes(mentionQuery.toLowerCase()))
                          .map(u => (
                            <div
                              key={u.id}
                              onClick={() => handleSelectMentionUser(u.userName)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] text-white cursor-pointer transition-colors"
                            >
                              <div className="w-5 h-5 rounded-full bg-[#27272A] text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {u.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-white truncate">@{u.userName}</span>
                                {u.email && <span className="text-[10px] text-[#71717A] truncate">{u.email}</span>}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer (Icons Left + Discard/Comment Right) */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#27272A]/80">
                    <div className="flex items-center gap-2 text-[#71717A]">
                      <button type="button" className="hover:text-white p-1 rounded-lg hover:bg-[#27272A] transition-colors cursor-pointer text-sm">
                        🙂
                      </button>
                      <button type="button" className="hover:text-white p-1 rounded-lg hover:bg-[#27272A] transition-colors cursor-pointer">
                        <PaperClipIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewCommentInput('')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        {language === 'az' ? 'Ləğv et' : language === 'en' ? 'Discard' : 'Отменить'}
                      </button>

                      <button
                        type="submit"
                        disabled={commentSubmitting || !newCommentInput.trim()}
                        className="px-4 py-1.5 rounded-xl bg-[#27272A] border border-[#3F3F46] hover:bg-white hover:text-black text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                      >
                        {commentSubmitting ? (language === 'az' ? 'Göndərilir...' : language === 'en' ? 'Posting...' : 'Публикация...') : (language === 'az' ? 'Şərh yaz' : language === 'en' ? 'Comment' : 'Комментировать')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* 4. DATA TAB */}
            {activeTab === 'Data' && (
              <>
                {/* Header Title & Controls */}
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Məlumat' : language === 'en' ? 'Data' : 'Данные'}</h1>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 border border-[#2C2C2E] rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                      title="Edit Layout"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="px-5 py-2 bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] text-white font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 text-xs shadow-sm"
                    >
                      {saving ? (language === 'az' ? 'Yadda saxlanılır...' : language === 'en' ? 'Saving...' : 'Сохранение...') : 'Save'}
                    </button>
                  </div>
                </div>

                {/* SECTION 1: DETAILS */}
                <div className="space-y-4">
                  <button
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                    className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer hover:text-sky-400 transition-colors"
                  >
                    <span>{language === 'az' ? 'Detallar' : language === 'en' ? 'Details' : 'Детали'}</span>
                    {isDetailsOpen ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronUpIcon className="w-3.5 h-3.5" />}
                  </button>

                  {isDetailsOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                      {/* Column 1 */}
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Təşkilat' : language === 'en' ? 'Organization' : 'Организация'}</label>
                          <input
                            type="text"
                            value={formData.organizationName}
                            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'İllik gəlir' : language === 'en' ? 'Annual Revenue' : 'Годовой доход'}</label>
                          <input
                            type="text"
                            value={formData.annualRevenue}
                            onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Veb sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}</label>
                          <input
                            type="text"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Sövdələşmə sahibi' : language === 'en' ? 'Deal Owner' : 'Владелец сделки'}</label>
                          <select
                            value={formData.dealOwner}
                            onChange={(e) => setFormData({ ...formData, dealOwner: e.target.value })}
                            className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                          >
                            {ownerList.map((o) => (
                              <option key={o.name} value={o.name}>{o.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <div className="h-px bg-[#2C2C2E]/60 my-5"></div>

                {/* SECTION 2: PRODUCTS TABLE */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-white block">{language === 'az' ? 'Məhsullar' : language === 'en' ? 'Products' : 'Товары'}</span>

                  <div className="bg-[#141416] border border-[#2C2C2E] rounded-2xl shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#2C2C2E] text-[#A1A1AA] font-medium">
                          <th className="py-2.5 px-4 w-10">
                            <input
                              type="checkbox"
                              checked={products.length > 0 && selectedProductRowIndexes.length === products.length}
                              onChange={handleToggleSelectAllProducts}
                              className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="py-2.5 px-4 w-12">№</th>
                          <th className="py-2.5 px-4">{language === 'az' ? 'Məhsul' : language === 'en' ? 'Product' : 'Товар'}</th>
                          <th className="py-2.5 px-4 text-right">{language === 'az' ? 'Qiymət' : language === 'en' ? 'Rate' : 'Цена'} <span className="text-rose-400">*</span></th>
                          <th className="py-2.5 px-4 w-10 text-center">⚙️</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-[#71717A]">
                              {language === 'az' ? 'Məlumat yoxdur' : language === 'en' ? 'No Data' : 'Нет данных'}
                            </td>
                          </tr>
                        ) : (
                          products.map((p, index) => {
                            const filteredProds = availableProducts.filter(item =>
                              item.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                              (item.code && item.code.toLowerCase().includes(productSearchQuery.toLowerCase()))
                            );

                            return (
                              <tr key={p.id} className={`border-b border-[#2C2C2E]/60 text-white relative ${activeProductDropdownRowIndex === index ? 'z-30' : ''}`}>
                                <td className="py-2.5 px-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedProductRowIndexes.includes(index)}
                                    onChange={() => handleToggleSelectProductRow(index)}
                                    className="rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                                  />
                                </td>
                                <td className="py-2.5 px-4 font-medium text-[#A1A1AA]">{index + 1}</td>
                                <td className="py-2.5 px-4 relative">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveProductDropdownRowIndex(activeProductDropdownRowIndex === index ? null : index);
                                      setProductSearchQuery('');
                                    }}
                                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-1.5 text-xs text-white hover:border-[#3F3F46] transition-colors cursor-pointer"
                                  >
                                    <span className="truncate">{p.name || (language === 'az' ? 'Məhsul seçin...' : language === 'en' ? 'Select Product...' : 'Выберите товар...')}</span>
                                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                                  </button>

                                  {activeProductDropdownRowIndex === index && (
                                    <div className="absolute top-11 left-0 z-[100] w-64 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2.5 space-y-2 text-xs text-[#E4E4E7] animate-in fade-in duration-150">
                                      <div className="relative">
                                        <input
                                          type="text"
                                          placeholder="Search"
                                          value={productSearchQuery}
                                          onChange={(e) => setProductSearchQuery(e.target.value)}
                                          className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                                        />
                                        {productSearchQuery && (
                                          <button
                                            type="button"
                                            onClick={() => setProductSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
                                          >
                                            ×
                                          </button>
                                        )}
                                      </div>

                                      <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-0.5">
                                        {filteredProds.length === 0 ? (
                                          <div className="py-3 px-2 text-center text-[#71717A] text-[11px]">
                                            {language === 'az' ? 'Nəticə tapılmadı' : language === 'en' ? 'No results found' : 'Результатов не найдено'}
                                          </div>
                                        ) : (
                                          filteredProds.map((prod) => (
                                            <button
                                              key={prod.id}
                                              type="button"
                                              onClick={() => handleSelectProduct(index, prod)}
                                              className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between ${p.productId === prod.id ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                                                }`}
                                            >
                                              <span className="truncate">{prod.name}</span>
                                              <span className="text-[11px] text-[#A1A1AA] font-mono">${parseFloat(prod.rate || 0).toFixed(2)}</span>
                                            </button>
                                          ))
                                        )}
                                      </div>

                                      <div className="pt-1.5 border-t border-[#2C2C2E]/60 space-y-1">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenCreateModal(index)}
                                          className="w-full text-left px-2.5 py-1.5 rounded-xl bg-[#27272A]/70 hover:bg-[#27272A] text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                          <span>+ {language === 'az' ? 'Yenisini Yarat' : language === 'en' ? 'Create New' : 'Создать новый'}</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleClearProductRow(index)}
                                          className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-950/40 text-rose-400 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                          <span>✕ {language === 'az' ? 'Təmizlə' : language === 'en' ? 'Clear' : 'Очистить'}</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                                  ${(parseFloat(p.rate) || 0).toFixed(2)}
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleEditProductClick(index, p)}
                                    className="p-1 rounded-lg text-[#71717A] hover:text-white transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedProductRowIndexes.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeleteSelectedProductRows}
                        className="px-4 py-1.5 bg-[#D9383A] hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm animate-in fade-in duration-150"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddProductRow}
                      className="px-3.5 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#27272A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      {language === 'az' ? 'Sətir əlavə et' : language === 'en' ? 'Add Row' : 'Добавить строку'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3">
                    <div className="space-y-1.5">
                      <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Cəmi' : language === 'en' ? 'Total' : 'Итого'}</label>
                      <input
                        type="text"
                        readOnly
                        value={`$ ${products.reduce((sum, p) => sum + (parseFloat(p.rate) || 0), 0).toFixed(2)}`}
                        className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Xalis cəm' : language === 'en' ? 'Net Total' : 'Чистый итог'}</label>
                        <input
                          type="text"
                          readOnly
                          value={`$ ${products.reduce((sum, p) => sum + (parseFloat(p.rate) || 0), 0).toFixed(2)}`}
                          className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-white font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Endirimdən sonrakı məbləğ' : language === 'en' ? 'Total after discount' : 'Итого со скидкой'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 5. CALLS TAB */}
            {activeTab === 'Calls' && (
              <>
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Zənglər' : language === 'en' ? 'Calls' : 'Звонки'}</h1>
                  <button
                    type="button"
                    onClick={() => setIsNewCallModalOpen(true)}
                    className="flex items-center gap-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>{language === 'az' ? 'Zəng qeyd et' : language === 'en' ? 'Log a Call' : 'Записать звонок'}</span>
                  </button>
                </div>

                {callLogsList.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center text-[#71717A]">
                      <PhoneIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white mt-3">{language === 'az' ? 'Zəng tarixçəsi yoxdur' : language === 'en' ? 'No Call History' : 'История звонков пуста'}</h3>
                    <p className="text-xs text-[#A1A1AA] max-w-sm mt-1">
                      {language === 'az' ? 'Göstəriləcək zəng yoxdur. Zəng qeydiyyatı aparın və ya zəng edin!' : language === 'en' ? 'No recent calls to display. Log a call or call someone now!' : 'Нет недавних звонков для отображения.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {callLogsList.map((call, idx) => (
                      <div key={call.id || idx} className="bg-[#141416] border border-[#2C2C2E] rounded-2xl p-4 flex items-center justify-between text-xs text-[#E4E4E7]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                            <PhoneIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{call.caller || call.callerUserId || 'Administrator'}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27272A] text-sky-400 font-medium">{call.type || 'Outgoing'}</span>
                            </div>
                            <p className="text-[#A1A1AA] text-[11px] mt-0.5">To: {call.toNumber || call.receiver || 'Contact'} ({call.durationInSeconds ? `${call.durationInSeconds}s` : call.duration || '0s'})</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-[#71717A]">{call.createdOn || 'Recent'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 6. TASKS TAB */}
            {activeTab === 'Tasks' && (
              <>
                <TaskWidget />
              </>
            )}

            {/* 7. NOTES TAB */}
            {activeTab === 'Notes' && (
              <>
                <div className="flex items-center justify-between border-b border-[#2C2C2E]/40 pb-3.5">
                  <h1 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Qeydlər' : language === 'en' ? 'Notes' : 'Заметки'}</h1>
                  <button
                    type="button"
                    onClick={() => setIsNewNoteModalOpen(true)}
                    className="flex items-center gap-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>+ {language === 'az' ? 'Yeni Qeyd' : language === 'en' ? 'New Note' : 'Новая заметка'}</span>
                  </button>
                </div>

                {notesList.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center text-[#71717A]">
                      <DocumentTextIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white mt-3">{language === 'az' ? 'Qeyd tapılmadı' : language === 'en' ? 'No Notes Found' : 'Заметок не найдено'}</h3>
                    <p className="text-xs text-[#A1A1AA] max-w-sm mt-1">
                      {language === 'az' ? 'Hələ ki heç bir qeyd yoxdur. İzləmək üçün qeyd əlavə edin.' : language === 'en' ? 'Nothing here for now. Add a note to keep track of things.' : 'Пока здесь ничего нет. Добавьте заметку.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {notesList.map((note, idx) => (
                      <div key={note.id || idx} className="bg-[#141416] border border-[#2C2C2E] rounded-2xl p-4 space-y-2 text-xs text-[#E4E4E7]">
                        <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-2">
                          <div className="flex items-center gap-2">
                            <DocumentTextIcon className="w-4 h-4 text-sky-400" />
                            <span className="font-bold text-white text-sm">{note.title || 'Untitled Note'}</span>
                          </div>
                          <span className="text-[11px] text-[#71717A]">{note.lastModified || 'Recent'}</span>
                        </div>
                        <p className="text-[#D4D4D8] leading-relaxed whitespace-pre-line">{note.content}</p>
                        <div className="text-[11px] text-[#71717A] pt-1">By: {note.owner || note.createdByName || 'Administrator'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 8. ATTACHMENTS TAB */}
            {activeTab === 'Attachments' && (
              <AttachmentWidget
                dealId={id}
                title={dealTitle}
              />
            )}

          </div>

          {/* Bottom Fixed Action Bar */}
          <div className="pt-4 border-t border-[#2C2C2E]/60 flex items-center gap-6 text-xs text-[#A1A1AA] font-medium shrink-0">
            <button type="button" onClick={() => setActiveTab('Emails')} className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <EnvelopeIcon className="w-4 h-4" />
              <span>{language === 'az' ? 'Cavabla' : language === 'en' ? 'Reply' : 'Ответить'}</span>
            </button>
            <button type="button" onClick={() => setActiveTab('Comments')} className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{language === 'az' ? 'Şərh yaz' : language === 'en' ? 'Comment' : 'Комментарий'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR SUMMARY PANEL */}
        <div className="w-full lg:w-80 shrink-0 border-l border-[#2C2C2E]/60 bg-[#121214] p-5 space-y-5 text-xs overflow-y-auto custom-scrollbar">
          <div className="flex justify-end text-[11px] text-[#A1A1AA] font-mono tracking-tight">
            CRM-DEAL-2026-00017
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-white font-bold text-base shrink-0">
              {dealTitle ? dealTitle.charAt(0).toUpperCase() : 'A'}
            </div>
            <h2 className="text-sm font-bold text-white leading-tight truncate">{dealTitle}</h2>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button type="button" className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer" title="Email">
              <EnvelopeIcon className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer" title="Link">
              <LinkIcon className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer" title="Attachment">
              <PaperClipIcon className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleDeleteDeal} className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl hover:bg-rose-950/60 text-rose-400 transition-colors cursor-pointer" title="Delete">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="h-px bg-[#2C2C2E]/60 my-2"></div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsContactsOpen(!isContactsOpen)}
                className="flex items-center gap-1.5 font-bold text-white cursor-pointer hover:text-sky-400 transition-colors"
              >
                <span>{language === 'az' ? 'Əlaqələr' : language === 'en' ? 'Contacts' : 'Контакты'}</span>
                {isContactsOpen ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronUpIcon className="w-3.5 h-3.5" />}
              </button>
              <button type="button" className="text-[#A1A1AA] hover:text-white transition-colors cursor-pointer">
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {isContactsOpen && (
              <div className="space-y-2">
                <div
                  onClick={() => navigate(`/crm/contacts/${formData.contactId || '1'}`)}
                  className="flex items-center justify-between bg-[#1C1C1E] border border-[#2C2C2E] hover:border-sky-400 rounded-xl p-2 text-xs cursor-pointer transition-colors group"
                  title="View Contact Detail"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#27272A] text-white text-[10px] font-bold flex items-center justify-center">
                      {formData.contactName ? formData.contactName.charAt(0) : 'N'}
                    </span>
                    <span className="font-semibold text-white group-hover:text-sky-400 transition-colors">{formData.contactName || 'Ravan Umudov'}</span>
                    <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                      Primary
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[#A1A1AA] group-hover:text-white transition-colors">
                    <span className="hover:text-white px-0.5">···</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 hover:text-sky-400" />
                    <ChevronRightIcon className="w-3.5 h-3.5 hover:text-sky-400" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-[#2C2C2E]/60 my-2"></div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsOrgDetailsOpen(!isOrgDetailsOpen)}
                className="flex items-center gap-1.5 font-bold text-white cursor-pointer hover:text-sky-400 transition-colors"
              >
                <span>{language === 'az' ? 'Təşkilatın Detalları' : language === 'en' ? 'Organization Details' : 'Детали организации'}</span>
                {isOrgDetailsOpen ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronUpIcon className="w-3.5 h-3.5" />}
              </button>
              <button type="button" className="text-[#A1A1AA] hover:text-white transition-colors cursor-pointer">
                <PencilSquareIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {isOrgDetailsOpen && (
              <div className="space-y-3 text-[#D4D4D8]">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A] text-[11px]">{language === 'az' ? 'Təşkilat' : language === 'en' ? 'Organization' : 'Организация'}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white">{formData.organizationName || '—'}</span>
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 text-[#A1A1AA]" />
                  </div>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Veb sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}</span>
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline truncate block font-mono">
                      {formData.website}
                    </a>
                  ) : (
                    <span className="text-[#71717A]">{language === 'az' ? 'Veb sayt əlavə et...' : language === 'en' ? 'Add Website...' : 'Добавить веб-сайт...'}</span>
                  )}
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'İllik gəlir' : language === 'en' ? 'Annual Revenue' : 'Годовой доход'}</span>
                  <span className="font-mono text-white">{formData.annualRevenue || '$ 0.00'}</span>
                </div>

                <div>
                  <span className="text-[#71717A] block text-[11px]">{language === 'az' ? 'Sövdələşmə sahibi' : language === 'en' ? 'Deal Owner' : 'Владелец сделки'}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#27272A] text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                      {ownerObj.initial}
                    </span>
                    <span className="font-semibold text-white">{formData.dealOwner}</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE NOTE MODAL */}
      {isNewNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-xl text-[#E4E4E7] space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">{language === 'az' ? 'Qeyd Yarat' : language === 'en' ? 'Create Note' : 'Создать заметку'}</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewNoteModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateNoteSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'} <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder={language === 'az' ? 'Başlıq' : language === 'en' ? 'Title' : 'Заголовок'}
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Məzmun' : language === 'en' ? 'Content' : 'Содержимое'}</label>
                <RichTextEditor
                  value={noteForm.content}
                  onChange={(html) => setNoteForm({ ...noteForm, content: html })}
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  {t('common.create', {}, 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CALL LOG MODAL */}
      {isNewCallModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl p-6 w-full max-w-lg text-[#E4E4E7] space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">{language === 'az' ? 'Zəng qeydi yarat' : language === 'en' ? 'Create Call Log' : 'Записать звонок'}</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCallModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateCallSubmit} className="space-y-4 text-xs">
              {/* Row 1: Type * & To Number * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Növ' : language === 'en' ? 'Type' : 'Тип'} <span className="text-rose-400">*</span></label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdownField(openDropdownField === 'type' ? null : 'type')}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <span>{callForm.type || (language === 'az' ? 'Növ' : language === 'en' ? 'Type' : 'Тип')}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'type' && (
                    <div className="absolute top-14 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-[100] text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                      {callTypes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setCallForm({ ...callForm, type: t });
                            setOpenDropdownField(null);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${callForm.type === t ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                            }`}
                        >
                          <span>{t}</span>
                          {callForm.type === t && <CheckIcon className="w-4 h-4 text-sky-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Qəbul edən nömrə' : language === 'en' ? 'To Number' : 'Номер получателя'} <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'az' ? 'Qəbul edən nömrə' : language === 'en' ? 'To Number' : 'Номер получателя'}
                    value={callForm.toNumber}
                    onChange={(e) => setCallForm({ ...callForm, toNumber: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Row 2: From Number * & Status * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Zəng edən nömrə' : language === 'en' ? 'From Number' : 'Номер звонящего'} <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'az' ? 'Zəng edən nömrə' : language === 'en' ? 'From Number' : 'Номер звонящего'}
                    value={callForm.fromNumber}
                    onChange={(e) => setCallForm({ ...callForm, fromNumber: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Status' : language === 'en' ? 'Status' : 'Статус'} <span className="text-rose-400">*</span></label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdownField(openDropdownField === 'status' ? null : 'status')}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <span className="truncate">{callForm.status || (language === 'az' ? 'Status' : language === 'en' ? 'Status' : 'Статус')}</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'status' && (
                    <div className="absolute top-14 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-[100] text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150 max-h-48 overflow-y-auto custom-scrollbar">
                      {callStatuses.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setCallForm({ ...callForm, status: st });
                            setOpenDropdownField(null);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${callForm.status === st ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                            }`}
                        >
                          <span>{st}</span>
                          {callForm.status === st && <CheckIcon className="w-4 h-4 text-sky-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Duration & Dynamic User */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Müddət' : language === 'en' ? 'Duration' : 'Длительность'}</label>
                  <input
                    type="text"
                    placeholder="30s"
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[#A1A1AA] font-medium">
                    {callForm.type === 'Incoming' ? (language === 'az' ? 'Qəbul edən istifadəçi' : language === 'en' ? 'Call Received By' : 'Принял звонок') : (language === 'az' ? 'Zəng edən istifadəçi' : language === 'en' ? 'Caller' : 'Звонящий')}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setOpenDropdownField(openDropdownField === 'callUser' ? null : 'callUser'); setDropdownSearch(''); }}
                    className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-[#D4D4D8] focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <span className="truncate">
                      {callForm.type === 'Incoming' ? (callForm.receiver || (language === 'az' ? 'Qəbul edən' : 'Receiver')) : (callForm.caller || (language === 'az' ? 'Zəng edən' : 'Caller'))}
                    </span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  </button>

                  {openDropdownField === 'callUser' && (
                    <div className="absolute top-14 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-[100] text-xs text-[#E4E4E7] space-y-2 animate-in fade-in duration-150">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('common.search', {}, 'Search')}
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl pl-3 pr-7 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
                        {ownerList.filter(o => o.name.toLowerCase().includes(dropdownSearch.toLowerCase())).map((usr) => (
                          <button
                            key={usr.name}
                            type="button"
                            onClick={() => {
                              if (callForm.type === 'Incoming') {
                                setCallForm({ ...callForm, receiver: usr.name });
                              } else {
                                setCallForm({ ...callForm, caller: usr.name });
                              }
                              setOpenDropdownField(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${(callForm.type === 'Incoming' ? callForm.receiver : callForm.caller) === usr.name ? 'bg-[#2C2C2E] text-white font-semibold' : 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]'
                              }`}
                          >
                            {usr.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  {t('common.create', {}, 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW PRODUCT MODAL */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl w-full max-w-xl p-6 text-[#E4E4E7] space-y-5 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editingProductId ? (language === 'az' ? 'Məhsulu Redaktə Et' : language === 'en' ? 'Edit Product' : 'Редактировать товар') : (language === 'az' ? 'Yeni Məhsul' : language === 'en' ? 'New Product' : 'Новый товар')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                  title="Edit Fields Layout"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewProductModalOpen(false);
                    setEditingProductId(null);
                  }}
                  className="p-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3.5">
                  {/* Naming Series Dropdown */}
                  <div className="space-y-1.5 relative">
                    <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Adlandırma seriyası' : language === 'en' ? 'Naming Series' : 'Серия нумерации'}</label>
                    <button
                      type="button"
                      onClick={() => setIsNamingSeriesOpen(!isNamingSeriesOpen)}
                      className="flex items-center justify-between w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <span>{newProductForm.namingSeries}</span>
                      <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                    </button>

                    {isNamingSeriesOpen && (
                      <div className="absolute top-14 left-0 w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-[200] text-xs text-[#E4E4E7] space-y-0.5 animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setNewProductForm({ ...newProductForm, namingSeries: 'CRM-PROD-.YYYY.-' });
                            setIsNamingSeriesOpen(false);
                          }}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-[#2C2C2E] text-white font-semibold text-left cursor-pointer"
                        >
                          <span>CRM-PROD-.YYYY.-</span>
                          <CheckIcon className="w-4 h-4 text-sky-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Product Code */}
                  <div className="space-y-1.5">
                    <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Məhsul Kodu' : language === 'en' ? 'Product Code' : 'Код товара'} <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'az' ? 'Məhsul Kodu' : language === 'en' ? 'Product Code' : 'Код товара'}
                      value={newProductForm.productCode}
                      onChange={(e) => setNewProductForm({ ...newProductForm, productCode: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Product Name */}
                  <div className="space-y-1.5">
                    <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Məhsul Adı' : language === 'en' ? 'Product Name' : 'Наименование товара'}</label>
                    <input
                      type="text"
                      placeholder={language === 'az' ? 'Məhsul Adı' : language === 'en' ? 'Product Name' : 'Наименование товара'}
                      value={newProductForm.productName}
                      onChange={(e) => setNewProductForm({ ...newProductForm, productName: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3.5">
                  {/* Disabled Checkbox */}
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="disabledCheck"
                      checked={newProductForm.disabled}
                      onChange={(e) => setNewProductForm({ ...newProductForm, disabled: e.target.checked })}
                      className="w-4 h-4 rounded border-[#3F3F46] bg-[#27272A] text-sky-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="disabledCheck" className="text-[#A1A1AA] font-medium cursor-pointer">{language === 'az' ? 'Deaktiv' : language === 'en' ? 'Disabled' : 'Отключен'}</label>
                  </div>

                  {/* Standard Selling Rate */}
                  <div className="space-y-1.5">
                    <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Standart Satış Qiyməti' : language === 'en' ? 'Standard Selling Rate' : 'Стандартная цена продажи'}</label>
                    <input
                      type="text"
                      placeholder="$ 0.00"
                      value={newProductForm.standardSellingRate ? `$ ${newProductForm.standardSellingRate}` : '$ 0.00'}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        setNewProductForm({ ...newProductForm, standardSellingRate: raw });
                      }}
                      className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Image Attachment Trigger */}
                  <div className="space-y-1.5">
                    <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Şəkil' : language === 'en' ? 'Image' : 'Изображение'}</label>
                    <button
                      type="button"
                      onClick={() => setIsAttachModalOpen(true)}
                      className="flex items-center gap-2 w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs text-[#71717A] hover:text-white hover:border-[#3F3F46] transition-colors cursor-pointer text-left"
                    >
                      <PaperClipIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{newProductForm.image || (language === 'az' ? 'Fayl əlavə et...' : language === 'en' ? 'Attach file...' : 'Прикрепить файл...')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description Section with RichTextEditor */}
              <div className="space-y-1.5 pt-2 border-t border-[#2C2C2E]/60">
                <label className="text-[#A1A1AA] font-medium">{language === 'az' ? 'Təsvir' : language === 'en' ? 'Description' : 'Описание'}</label>
                <RichTextEditor
                  value={newProductForm.description}
                  onChange={(html) => setNewProductForm({ ...newProductForm, description: html })}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors shadow-md cursor-pointer"
                >
                  {editingProductId ? (language === 'az' ? 'Yadda Saxla' : language === 'en' ? 'Save' : 'Сохранить') : (language === 'az' ? 'Yarat' : language === 'en' ? 'Create' : 'Создать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTACH MODAL */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl w-full max-w-lg p-6 text-[#E4E4E7] space-y-6 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <h2 className="text-xl font-bold text-white tracking-tight">{language === 'az' ? 'Əlavə et' : language === 'en' ? 'Attach' : 'Прикрепить'}</h2>
              <button
                type="button"
                onClick={() => {
                  setIsAttachModalOpen(false);
                  setSelectedAttachFile(null);
                  setAttachLinkUrl('');
                }}
                className="p-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Main Drag & Drop / Upload Box */}
            <div className="border border-dashed border-[#3F3F46] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-5 bg-[#141416]/50">
              <p className="text-xs text-[#A1A1AA] font-medium">
                {language === 'az' ? 'Faylları buraya sürükləyin və ya seçin' : language === 'en' ? 'Drag & Drop files here or upload from' : 'Перетащите файлы сюда или загрузите'}
              </p>

              {/* 3 Upload Mode Buttons: Device, Link, Camera */}
              <div className="flex items-center justify-center gap-6">
                {/* 1. Device Option */}
                <div className="flex flex-col items-center gap-1.5">
                  <label
                    htmlFor="deviceFileInput"
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center ${attachTab === 'device' ? 'bg-[#2C2C2E] border-sky-500 text-sky-400' : 'bg-[#1C1C1E] border-[#2C2C2E] text-white hover:bg-[#2C2C2E]'
                      }`}
                    onClick={() => setAttachTab('device')}
                  >
                    <ComputerDesktopIcon className="w-5 h-5" />
                  </label>
                  <span className="text-[11px] text-[#A1A1AA] font-medium">{language === 'az' ? 'Cihaz' : language === 'en' ? 'Device' : 'Устройство'}</span>
                  <input
                    type="file"
                    id="deviceFileInput"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedAttachFile(e.target.files[0]);
                        setAttachTab('device');
                      }
                    }}
                  />
                </div>

                {/* 2. Link Option */}
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAttachTab('link')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center ${attachTab === 'link' ? 'bg-[#2C2C2E] border-sky-500 text-sky-400' : 'bg-[#1C1C1E] border-[#2C2C2E] text-white hover:bg-[#2C2C2E]'
                      }`}
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                  <span className="text-[11px] text-[#A1A1AA] font-medium">{language === 'az' ? 'Keçid' : language === 'en' ? 'Link' : 'Ссылка'}</span>
                </div>

                {/* 3. Camera Option */}
                <div className="flex flex-col items-center gap-1.5">
                  <label
                    htmlFor="cameraFileInput"
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center ${attachTab === 'camera' ? 'bg-[#2C2C2E] border-sky-500 text-sky-400' : 'bg-[#1C1C1E] border-[#2C2C2E] text-white hover:bg-[#2C2C2E]'
                      }`}
                    onClick={() => setAttachTab('camera')}
                  >
                    <CameraIcon className="w-5 h-5" />
                  </label>
                  <span className="text-[11px] text-[#A1A1AA] font-medium">{language === 'az' ? 'Kamera' : language === 'en' ? 'Camera' : 'Камера'}</span>
                  <input
                    type="file"
                    id="cameraFileInput"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedAttachFile(e.target.files[0]);
                        setAttachTab('camera');
                      }
                    }}
                  />
                </div>
              </div>

              {/* Selected file or Link Input display */}
              {attachTab === 'link' && (
                <div className="w-full max-w-sm pt-2">
                  <input
                    type="url"
                    placeholder={language === 'az' ? 'Şəkil linkini daxil edin (https://...)' : 'Paste image URL (https://...)'}
                    value={attachLinkUrl}
                    onChange={(e) => setAttachLinkUrl(e.target.value)}
                    className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              {selectedAttachFile && (attachTab === 'device' || attachTab === 'camera') && (
                <div className="text-xs text-sky-400 font-medium bg-sky-950/40 border border-sky-800/50 rounded-xl px-3 py-1.5 truncate max-w-xs">
                  📄 {selectedAttachFile.name}
                </div>
              )}
            </div>

            {/* Modal Bottom Right Action Button: Attach */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                disabled={!selectedAttachFile && !attachLinkUrl}
                onClick={handleConfirmAttach}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm ${(selectedAttachFile || attachLinkUrl)
                    ? 'bg-white hover:bg-zinc-200 text-black cursor-pointer font-bold'
                    : 'bg-[#27272A] text-[#71717A] cursor-not-allowed'
                  }`}
              >
                {uploadingAttach ? (language === 'az' ? 'Yüklənir...' : language === 'en' ? 'Uploading...' : 'Загрузка...') : (language === 'az' ? 'Əlavə et' : language === 'en' ? 'Attach' : 'Прикрепить')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealDetailPage;
