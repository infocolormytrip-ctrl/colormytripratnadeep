import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Booking, VendorPayment, MasterVendor } from '../types';
import {
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Landmark,
  FileText,
  HelpCircle,
  Upload
} from 'lucide-react';

export default function TourTracker() {
  const {
    bookings,
    vendorPayments,
    addBookingDirect,
    addBookingsBulk,
    updateBooking,
    updateBookingsBulk,
    deleteBooking,
    addVendorPayment,
    updateVendorPayment,
    deleteVendorPayment,
    masterVendors,
    addMasterVendor,
    updateMasterVendor,
    deleteMasterVendor,
    showToast
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'bookings' | 'payments' | 'vendors' | 'directory'>('dashboard');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorPayment | null>(null);
  const [vendorBookingId, setVendorBookingId] = useState('');

  const [showPaymentRecordModal, setShowPaymentRecordModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [recordedAmount, setRecordedAmount] = useState('');
  const [recordedMode, setRecordedMode] = useState('Bank Transfer');
  const [recordedRemarks, setRecordedRemarks] = useState('');
  const [recordedDueDate, setRecordedDueDate] = useState('');

  // Vendor Directory States
  const [showMasterVendorModal, setShowMasterVendorModal] = useState(false);
  const [editingMasterVendor, setEditingMasterVendor] = useState<MasterVendor | null>(null);
  const [masterVendorForm, setMasterVendorForm] = useState({
    name: '',
    location: '',
    contactPerson: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [masterLocationFilter, setMasterLocationFilter] = useState('all');

  // Form States for Direct Booking creation/edit
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    source: 'Website',
    destination: '',
    packageName: '',
    travelType: 'Customized' as 'Group' | 'Customized',
    noOfPax: 2,
    noOfRooms: 1,
    travelStartDate: '',
    travelEndDate: '',
    hotelDetails: '',
    mealPlan: 'MAPAI (Breakfast & Dinner)',
    transportType: 'Private Sedan',
    pickupPoint: '',
    totalPackageCost: '',
    advanceReceived: '0',
    assignedStaff: '',
    specialNotes: '',
    voucherSent: 'No' as 'Yes' | 'No',
    ticketStatus: 'Pending' as 'Pending' | 'Booked' | 'N/A',
    tripStatus: 'Upcoming' as 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled',
    paymentRemarks: '',
    dueDate: '',
    zohoInvoiceNo: ''
  });

  // Form States for Vendor creation/edit
  const [vendorForm, setVendorForm] = useState({
    bookingId: '',
    vendorType: 'Hotel',
    vendorName: '',
    contact: '',
    totalCost: '',
    paid: '0',
    status: 'Unpaid' as 'Unpaid' | 'Partial' | 'Paid',
    notes: ''
  });

  // Calculate stats for Dashboard Tab
  const dashboardStats = useMemo(() => {
    const totalCount = bookings.length;
    const activeBookings = bookings.filter(b => b.tripStatus !== 'Cancelled');
    const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.bookingAmount || 0), 0);
    const totalVendorCost = activeBookings.reduce((sum, b) => sum + (b.vendorCost || 0), 0);
    const totalProfit = activeBookings.reduce((sum, b) => sum + (b.profit || 0), 0);
    const totalCollected = activeBookings.reduce((sum, b) => sum + (b.advanceReceived || 0), 0);
    const totalOutstanding = activeBookings.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);

    // Group vs Customized count
    const customizedCount = activeBookings.filter(b => b.travelType === 'Customized').length;
    const groupCount = activeBookings.filter(b => b.travelType === 'Group').length;

    // Upcoming, Ongoing, Completed counts
    const upcomingCount = activeBookings.filter(b => b.tripStatus === 'Upcoming').length;
    const ongoingCount = activeBookings.filter(b => b.tripStatus === 'Ongoing').length;
    const completedCount = activeBookings.filter(b => b.tripStatus === 'Completed').length;

    return {
      totalCount,
      totalRevenue,
      totalVendorCost,
      totalProfit,
      totalCollected,
      totalOutstanding,
      customizedCount,
      groupCount,
      upcomingCount,
      ongoingCount,
      completedCount
    };
  }, [bookings]);

  // Recalculate Vendor costs for a booking
  const syncVendorCostOnBooking = async (bookingId: string, currentVendorList?: VendorPayment[]) => {
    const bk = bookings.find(b => b.id === bookingId);
    if (!bk) return;

    const list = currentVendorList || vendorPayments;
    const bookingVendors = list.filter(v => v.bookingId === bookingId);
    const totalVendorCost = bookingVendors.reduce((sum, v) => sum + (v.totalCost || 0), 0);
    const profit = (bk.bookingAmount || 0) - totalVendorCost;

    await updateBooking(bookingId, {
      vendorCost: totalVendorCost,
      profit: profit
    });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const parseCSV = (csvText: string): string[][] => {
        const lines: string[][] = [];
        let row: string[] = [];
        let inQuotes = false;
        let currentVal = '';

        for (let i = 0; i < csvText.length; i++) {
          const char = csvText[i];
          const nextChar = csvText[i + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              currentVal += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            row.push(currentVal.trim());
            currentVal = '';
          } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') {
              i++;
            }
            row.push(currentVal.trim());
            lines.push(row);
            row = [];
            currentVal = '';
          } else {
            currentVal += char;
          }
        }

        if (row.length > 0 || currentVal) {
          row.push(currentVal.trim());
          lines.push(row);
        }

        return lines.filter(r => r.length > 0 && r.some(cell => cell !== ''));
      };

      const lines = parseCSV(text);
      if (lines.length < 2) {
        showToast('error', 'Invalid CSV', 'The CSV file is empty or does not contain a header row.');
        return;
      }

      const headers = lines[0].map(h => h.toLowerCase().replace(/^\uFEFF/i, '').trim());
      const dataRows = lines.slice(1);

      const toCreate: Omit<Booking, 'id' | 'createdAt'>[] = [];
      const toUpdate: { id: string; data: Partial<Booking> }[] = [];

      for (const row of dataRows) {
        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
          if (index < row.length) {
            record[header] = row[index];
          }
        });

        const bookingId = record['booking id'] || record['id'] || '';
        const clientName = record['client name'] || record['name'] || '';
        const clientEmail = record['client email'] || record['email'] || '';

        let matchedBooking = bookings.find(b => 
          (bookingId && b.id === bookingId) || 
          (clientEmail && b.clientEmail && b.clientEmail.toLowerCase() === clientEmail.toLowerCase()) ||
          (clientName && b.clientName && b.clientName.toLowerCase() === clientName.toLowerCase())
        );

        const bookingAmount = parseFloat(record['booking amount'] || record['amount'] || record['total package cost'] || '0') || 0;
        const advanceReceived = parseFloat(record['advance received'] || record['advance'] || '0') || 0;
        const balanceAmount = record['balance amount'] !== undefined 
          ? parseFloat(record['balance amount']) 
          : (bookingAmount - advanceReceived);
        const vendorCost = parseFloat(record['vendor cost'] || record['vendor'] || '0') || 0;
        const profit = record['profit'] !== undefined 
          ? parseFloat(record['profit']) 
          : (bookingAmount - vendorCost);

        const updatePayload: Partial<Booking> = {
          clientName: clientName || matchedBooking?.clientName || 'CSV Customer',
          clientPhone: record['client phone'] || record['phone'] || matchedBooking?.clientPhone || '',
          clientEmail: clientEmail || matchedBooking?.clientEmail || '',
          source: record['source'] || matchedBooking?.source || 'CSV Import',
          destination: record['destination'] || record['package name'] || matchedBooking?.destination || 'Tour',
          packageName: record['package name'] || record['destination'] || matchedBooking?.packageName || 'Tour',
          travelType: (record['travel type'] || matchedBooking?.travelType || 'Customized') as any,
          noOfPax: parseInt(record['no of pax'] || record['pax'] || '1') || matchedBooking?.noOfPax || 1,
          noOfRooms: parseInt(record['no of rooms'] || record['rooms'] || '1') || matchedBooking?.noOfRooms || 1,
          travelStartDate: record['travel start date'] || record['start date'] || record['travel date'] || matchedBooking?.travelStartDate || '',
          travelEndDate: record['travel end date'] || record['end date'] || matchedBooking?.travelEndDate || '',
          totalDays: parseInt(record['total days'] || record['days'] || '1') || matchedBooking?.totalDays || 1,
          hotelDetails: record['hotel details'] || record['hotel'] || matchedBooking?.hotelDetails || '',
          mealPlan: record['meal plan'] || record['meals'] || matchedBooking?.mealPlan || '',
          transportType: record['transport type'] || record['transport'] || matchedBooking?.transportType || '',
          pickupPoint: record['pickup point'] || record['pickup'] || matchedBooking?.pickupPoint || '',
          bookingAmount,
          advanceReceived,
          balanceAmount,
          vendorCost,
          profit,
          assignedStaff: record['assigned staff'] || record['staff'] || matchedBooking?.assignedStaff || '',
          specialNotes: record['special notes'] || record['notes'] || matchedBooking?.specialNotes || '',
          voucherSent: (record['voucher sent'] || matchedBooking?.voucherSent || 'No') as any,
          ticketStatus: (record['ticket status'] || matchedBooking?.ticketStatus || 'Pending') as any,
          tripStatus: (record['trip status'] || matchedBooking?.tripStatus || 'Upcoming') as any,
          paymentStatus: (record['payment status'] || (advanceReceived >= bookingAmount ? 'Paid' : (advanceReceived > 0 ? 'Partial' : 'Unpaid'))) as any,
        };

        if (matchedBooking) {
          toUpdate.push({ id: matchedBooking.id, data: updatePayload });
        } else {
          toCreate.push({
            ...updatePayload,
            bookingDate: record['booking date'] || new Date().toISOString().split('T')[0],
            bookingStatus: 'Confirmed',
          } as Omit<Booking, 'id' | 'createdAt'>);
        }
      }

      let updatedCount = 0;
      let createdCount = 0;
      let errorsCount = 0;

      if (toCreate.length > 0) {
        try {
          await addBookingsBulk(toCreate);
          createdCount = toCreate.length;
        } catch (err) {
          console.error('Error creating bookings in bulk:', err);
          errorsCount += toCreate.length;
        }
      }

      if (toUpdate.length > 0) {
        try {
          await updateBookingsBulk(toUpdate);
          updatedCount = toUpdate.length;
        } catch (err) {
          console.error('Error updating bookings in bulk:', err);
          errorsCount += toUpdate.length;
        }
      }

      showToast(
        errorsCount > 0 ? 'warning' : 'success',
        'CSV Import Finished',
        `Successfully processed: ${createdCount} created, ${updatedCount} updated. Errors: ${errorsCount}`
      );
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Handle Booking Save (Direct Creation / Edit)
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.clientName || !bookingForm.destination || !bookingForm.totalPackageCost) {
      showToast('error', 'Required Fields Missing', 'Please fill in client name, destination, and package cost.');
      return;
    }

    const packageCost = parseFloat(bookingForm.totalPackageCost) || 0;
    const advance = parseFloat(bookingForm.advanceReceived) || 0;
    const balance = packageCost - advance;
    const payStatus = advance >= packageCost ? 'Paid' : (advance > 0 ? 'Partial' : 'Unpaid');

    // Calculate total days
    let days = 1;
    if (bookingForm.travelStartDate && bookingForm.travelEndDate) {
      const start = new Date(bookingForm.travelStartDate);
      const end = new Date(bookingForm.travelEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const payload: Omit<Booking, 'id' | 'createdAt'> = {
      bookingAmount: packageCost,
      bookingDate: new Date().toISOString().split('T')[0],
      paymentStatus: payStatus,
      bookingStatus: 'Confirmed',
      remarks: bookingForm.specialNotes,

      clientName: bookingForm.clientName,
      clientPhone: bookingForm.clientPhone,
      clientEmail: bookingForm.clientEmail,
      source: bookingForm.source,
      destination: bookingForm.destination,
      packageName: bookingForm.packageName,
      travelType: bookingForm.travelType,
      noOfPax: Number(bookingForm.noOfPax),
      noOfRooms: Number(bookingForm.noOfRooms),
      travelStartDate: bookingForm.travelStartDate,
      travelEndDate: bookingForm.travelEndDate,
      travelDate: bookingForm.travelStartDate,
      totalDays: days,
      hotelDetails: bookingForm.hotelDetails,
      mealPlan: bookingForm.mealPlan,
      transportType: bookingForm.transportType,
      pickupPoint: bookingForm.pickupPoint,
      advanceReceived: advance,
      balanceAmount: balance,
      vendorCost: editingBooking ? editingBooking.vendorCost : 0,
      profit: editingBooking ? (packageCost - editingBooking.vendorCost) : packageCost,
      assignedStaff: bookingForm.assignedStaff,
      specialNotes: bookingForm.specialNotes,
      voucherSent: bookingForm.voucherSent,
      ticketStatus: bookingForm.ticketStatus,
      tripStatus: bookingForm.tripStatus,

      dueDate: bookingForm.dueDate,
      paymentRemarks: bookingForm.paymentRemarks,
      zohoInvoiceNo: bookingForm.zohoInvoiceNo
    };

    try {
      if (editingBooking) {
        await updateBooking(editingBooking.id, payload);
        showToast('success', 'Booking Updated', `Booking for ${bookingForm.clientName} has been saved.`);
      } else {
        await addBookingDirect(payload);
        showToast('success', 'Booking Created', `New booking for ${bookingForm.clientName} created successfully.`);
      }
      setShowBookingModal(false);
      setEditingBooking(null);
    } catch (err) {
      showToast('error', 'Error Saving Booking', 'An error occurred while saving booking data.');
    }
  };

  // Open booking edit modal
  const openEditBooking = (bk: Booking) => {
    setEditingBooking(bk);
    setBookingForm({
      clientName: bk.clientName,
      clientPhone: bk.clientPhone,
      clientEmail: bk.clientEmail,
      source: bk.source,
      destination: bk.destination,
      packageName: bk.packageName,
      travelType: bk.travelType,
      noOfPax: bk.noOfPax,
      noOfRooms: bk.noOfRooms,
      travelStartDate: bk.travelStartDate || '',
      travelEndDate: bk.travelEndDate || '',
      hotelDetails: bk.hotelDetails || '',
      mealPlan: bk.mealPlan || '',
      transportType: bk.transportType || '',
      pickupPoint: bk.pickupPoint || '',
      totalPackageCost: String(bk.bookingAmount),
      advanceReceived: String(bk.advanceReceived),
      assignedStaff: bk.assignedStaff || '',
      specialNotes: bk.specialNotes || '',
      voucherSent: bk.voucherSent,
      ticketStatus: bk.ticketStatus,
      tripStatus: bk.tripStatus,
      paymentRemarks: bk.paymentRemarks || '',
      dueDate: bk.dueDate || '',
      zohoInvoiceNo: bk.zohoInvoiceNo || ''
    });
    setShowBookingModal(true);
  };

  // Handle Client Payment Recording
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentBooking || !recordedAmount) return;

    const currentAdvance = paymentBooking.advanceReceived || 0;
    const additionalPayment = parseFloat(recordedAmount) || 0;
    const newAdvance = currentAdvance + additionalPayment;
    const packageCost = paymentBooking.bookingAmount || 0;
    const newBalance = Math.max(0, packageCost - newAdvance);
    const payStatus = newAdvance >= packageCost ? 'Paid' : (newAdvance > 0 ? 'Partial' : 'Unpaid');

    try {
      await updateBooking(paymentBooking.id, {
        advanceReceived: newAdvance,
        balanceAmount: newBalance,
        paymentStatus: payStatus,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        paymentMode: recordedMode,
        paymentRemarks: recordedRemarks || `Recorded payment of ₹${additionalPayment}`,
        dueDate: recordedDueDate || paymentBooking.dueDate || ''
      });

      showToast('success', 'Payment Recorded', `Recorded ₹${additionalPayment} for ${paymentBooking.clientName}.`);
      setShowPaymentRecordModal(false);
      setPaymentBooking(null);
      setRecordedAmount('');
      setRecordedRemarks('');
    } catch (err) {
      showToast('error', 'Error', 'Failed to record client payment.');
    }
  };

  // Handle Vendor Save (Creation / Edit)
  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.vendorName || !vendorForm.totalCost) {
      showToast('error', 'Required Fields Missing', 'Please fill in vendor name and total cost.');
      return;
    }

    const bookingId = editingVendor ? editingVendor.bookingId : vendorBookingId;
    if (!bookingId) {
      showToast('error', 'No Booking Selected', 'Please select a Booking ID for this vendor bill.');
      return;
    }

    const totalCost = parseFloat(vendorForm.totalCost) || 0;
    const paid = parseFloat(vendorForm.paid) || 0;
    const balance = totalCost - paid;
    const status = paid >= totalCost ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid');

    const payload: Omit<VendorPayment, 'id' | 'createdAt'> = {
      bookingId,
      vendorType: vendorForm.vendorType,
      vendorName: vendorForm.vendorName,
      contact: vendorForm.contact,
      totalCost,
      paid,
      balance,
      status,
      notes: vendorForm.notes
    };

    try {
      let updatedList = [...vendorPayments];
      if (editingVendor) {
        await updateVendorPayment(editingVendor.id, payload);
        updatedList = updatedList.map(v => v.id === editingVendor.id ? { ...v, ...payload } : v);
        showToast('success', 'Vendor Bill Updated', `Saved bill of ${vendorForm.vendorName}.`);
      } else {
        const added = await addVendorPayment(payload);
        updatedList.push(added);
        showToast('success', 'Vendor Bill Recorded', `Added bill for ${vendorForm.vendorName}.`);
      }

      // Sync booking's vendor cost
      await syncVendorCostOnBooking(bookingId, updatedList);

      setShowVendorModal(false);
      setEditingVendor(null);
    } catch (err) {
      showToast('error', 'Error Saving Vendor Payment', 'An error occurred.');
    }
  };

  // Open Vendor Edit Modal
  const openEditVendor = (vp: VendorPayment) => {
    setEditingVendor(vp);
    setVendorForm({
      bookingId: vp.bookingId,
      vendorType: vp.vendorType,
      vendorName: vp.vendorName,
      contact: vp.contact,
      totalCost: String(vp.totalCost),
      paid: String(vp.paid),
      status: vp.status,
      notes: vp.notes || ''
    });
    setShowVendorModal(true);
  };

  // Master Vendor Directory CRUD Handlers
  const handleMasterVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterVendorForm.name || !masterVendorForm.location) {
      showToast('error', 'Required Fields Missing', 'Please fill in vendor name and location.');
      return;
    }

    try {
      if (editingMasterVendor) {
        await updateMasterVendor(editingMasterVendor.id, masterVendorForm);
        showToast('success', 'Vendor Updated', `Master record for ${masterVendorForm.name} saved successfully.`);
      } else {
        await addMasterVendor(masterVendorForm);
        showToast('success', 'Vendor Created', `New master record for ${masterVendorForm.name} created successfully.`);
      }
      setShowMasterVendorModal(false);
      setEditingMasterVendor(null);
    } catch (err) {
      showToast('error', 'Error Saving Vendor', 'An error occurred while saving master vendor details.');
    }
  };

  const openEditMasterVendor = (mv: MasterVendor) => {
    setEditingMasterVendor(mv);
    setMasterVendorForm({
      name: mv.name,
      location: mv.location,
      contactPerson: mv.contactPerson || '',
      phone: mv.phone || '',
      email: mv.email || '',
      notes: mv.notes || ''
    });
    setShowMasterVendorModal(true);
  };

  const handleMasterVendorDelete = async (mv: MasterVendor) => {
    if (window.confirm(`Are you sure you want to delete ${mv.name} from the master directory?`)) {
      try {
        await deleteMasterVendor(mv.id);
        showToast('success', 'Vendor Deleted', 'Master vendor record removed successfully.');
      } catch (err) {
        showToast('error', 'Delete Failed', 'Failed to remove master vendor record.');
      }
    }
  };

  // Handle Booking Delete
  const handleBookingDelete = async (id: string, client: string) => {
    if (window.confirm(`Are you sure you want to delete the booking for ${client}?`)) {
      try {
        await deleteBooking(id);
        // Also delete any vendor payments linked to this booking
        const linkedVendors = vendorPayments.filter(v => v.bookingId === id);
        for (const v of linkedVendors) {
          await deleteVendorPayment(v.id);
        }
        showToast('success', 'Booking Deleted', `Removed booking and all associated vendor bills.`);
      } catch (err) {
        showToast('error', 'Delete Failed', 'Failed to remove booking records.');
      }
    }
  };

  // Handle Vendor Delete
  const handleVendorDelete = async (vp: VendorPayment) => {
    if (window.confirm(`Delete vendor bill of ₹${vp.totalCost} for ${vp.vendorName}?`)) {
      try {
        await deleteVendorPayment(vp.id);
        const remaining = vendorPayments.filter(v => v.id !== vp.id);
        await syncVendorCostOnBooking(vp.bookingId, remaining);
        showToast('success', 'Bill Deleted', 'Vendor bill removed successfully.');
      } catch (err) {
        showToast('error', 'Delete Failed', 'Failed to remove vendor bill.');
      }
    }
  };

  // Filtering lists
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch =
        b.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.assignedStaff?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
      const matchesType = typeFilter === 'all' || b.travelType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bookings, searchTerm, statusFilter, typeFilter]);

  const filteredVendorPayments = useMemo(() => {
    return vendorPayments.filter(vp => {
      const matchesSearch =
        vp.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vp.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vp.vendorType?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || vp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vendorPayments, searchTerm, statusFilter]);

  const filteredMasterVendors = useMemo(() => {
    return masterVendors.filter(mv => {
      const matchesSearch =
        mv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mv.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mv.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mv.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation = masterLocationFilter === 'all' || mv.location.toLowerCase() === masterLocationFilter.toLowerCase();

      return matchesSearch && matchesLocation;
    });
  }, [masterVendors, searchTerm, masterLocationFilter]);

  const uniqueVendorLocations = useMemo(() => {
    const locSet = new Set<string>();
    masterVendors.forEach(v => {
      if (v.location) locSet.add(v.location.trim());
    });
    return Array.from(locSet).sort();
  }, [masterVendors]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 p-6 overflow-y-auto font-sans">
      
      {/* Upper Title and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800">
        <div>
          <span className="text-indigo-400 text-xs font-mono uppercase tracking-wider block mb-1">ColorMyTrip Administrative Desk</span>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Landmark className="w-7 h-7 text-indigo-500" />
            Tour & Booking Tracker
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1">
          {(['dashboard', 'bookings', 'payments', 'vendors', 'directory'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveSubTab(tab);
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                activeSubTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab === 'dashboard' ? 'Business Dashboard' : tab === 'directory' ? 'Vendor Directory' : `${tab} tracker`}
            </button>
          ))}
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Card KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Total Bookings</span>
                <span className="text-2xl font-extrabold text-white block">{dashboardStats.totalCount}</span>
                <span className="text-[10px] text-slate-500 block">Active & Upcoming Trips</span>
              </div>
              <div className="p-3.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Total Revenue</span>
                <span className="text-2xl font-extrabold text-emerald-400 block">₹{dashboardStats.totalRevenue.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-slate-500 block">Collected: ₹{dashboardStats.totalCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Vendor Expenses</span>
                <span className="text-2xl font-extrabold text-orange-400 block">₹{dashboardStats.totalVendorCost.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-slate-500 block">Outstanding: ₹{dashboardStats.totalOutstanding.toLocaleString('en-IN')} Bal</span>
              </div>
              <div className="p-3.5 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-400">
                <Landmark className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-2xl flex items-center justify-between bg-gradient-to-br from-slate-900 to-indigo-950/20">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Projected Profit</span>
                <span className="text-2xl font-extrabold text-indigo-400 block">
                  ₹{dashboardStats.totalProfit.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-indigo-300/50 block">
                  Margin: {dashboardStats.totalRevenue ? Math.round((dashboardStats.totalProfit / dashboardStats.totalRevenue) * 100) : 0}%
                </span>
              </div>
              <div className="p-3.5 bg-indigo-500/20 rounded-xl border border-indigo-500/40 text-indigo-300">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Business Summary details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Tour Types Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Customized Tours</span>
                    <span className="font-bold text-white">{dashboardStats.customizedCount} / {dashboardStats.totalCount}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${dashboardStats.totalCount ? (dashboardStats.customizedCount / dashboardStats.totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Fixed Group Departures</span>
                    <span className="font-bold text-white">{dashboardStats.groupCount} / {dashboardStats.totalCount}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${dashboardStats.totalCount ? (dashboardStats.groupCount / dashboardStats.totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Trip Status Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Upcoming</span>
                  <span className="text-2xl font-black text-white">{dashboardStats.upcomingCount}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold block mb-1">Ongoing</span>
                  <span className="text-2xl font-black text-indigo-400">{dashboardStats.ongoingCount}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">Completed</span>
                  <span className="text-2xl font-black text-emerald-400">{dashboardStats.completedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DASHBOARD TAB */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-850">
            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search client, destination, staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Travel Types</option>
                <option value="Customized">Customized</option>
                <option value="Group">Group</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingBooking(null);
                setBookingForm({
                  clientName: '',
                  clientPhone: '',
                  clientEmail: '',
                  source: 'Website',
                  destination: '',
                  packageName: '',
                  travelType: 'Customized',
                  noOfPax: 2,
                  noOfRooms: 1,
                  travelStartDate: '',
                  travelEndDate: '',
                  hotelDetails: '',
                  mealPlan: 'MAPAI (Breakfast & Dinner)',
                  transportType: 'Private Sedan',
                  pickupPoint: '',
                  totalPackageCost: '',
                  advanceReceived: '0',
                  assignedStaff: '',
                  specialNotes: '',
                  voucherSent: 'No',
                  ticketStatus: 'Pending',
                  tripStatus: 'Upcoming',
                  paymentRemarks: '',
                  dueDate: '',
                  zohoInvoiceNo: ''
                });
                setShowBookingModal(true);
              }}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow shadow-indigo-900/30 transition-all active:scale-[0.98] w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Booking
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-slate-955 hover:bg-slate-850 text-slate-350 hover:text-white border border-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] w-full sm:w-auto justify-center"
              title="Bulk Import via CSV"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              Bulk Booking
            </button>
            {bookings.some(b => b.clientName === 'CSV Customer') && (
              <button
                onClick={async () => {
                  const targetList = bookings.filter(b => b.clientName === 'CSV Customer');
                  if (window.confirm(`Are you sure you want to delete all ${targetList.length} bookings with client name "CSV Customer"?`)) {
                    for (const bk of targetList) {
                      try {
                        await deleteBooking(bk.id);
                      } catch (err) {
                        console.error('Failed to delete booking:', bk.id, err);
                      }
                    }
                    showToast('success', 'Cleaned bookings', 'Removed all bookings with name "CSV Customer".');
                  }
                }}
                className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 hover:border-red-700/60 text-red-300 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] w-full sm:w-auto justify-center"
              >
                <Trash2 className="w-4 h-4 text-red-450" />
                Clear "CSV Customer"
              </button>
            )}
          </div>

          {/* Bookings Table container */}
          <div className="bg-slate-900/40 border border-slate-855 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-855 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Client Name</th>
                    <th className="p-4">Destination / Package</th>
                    <th className="p-4">Dates / Days</th>
                    <th className="p-4">Pax/Rooms</th>
                    <th className="p-4">Staff</th>
                    <th className="p-4 text-right">Cost (₹)</th>
                    <th className="p-4 text-right">Vendor (₹)</th>
                    <th className="p-4 text-right">Profit (₹)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-855">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-500">
                        No bookings found. Click "Add Booking" to register one.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((bk, idx) => (
                      <tr key={bk.id || idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-400">
                          <span className="block">{(bk.id || '').startsWith('CMT') ? bk.id : (bk.id || '').substring(0, 8) || 'Staged'}</span>
                          {bk.zohoInvoiceNo && (
                            <span className="text-[10px] text-indigo-300 font-sans font-bold block mt-0.5" title="Zoho Invoice Number">
                              📄 {bk.zohoInvoiceNo}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white block">{bk.clientName}</span>
                          <span className="text-[10px] text-slate-500 block">{bk.clientPhone || bk.clientEmail}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-white block">{bk.destination}</span>
                          <span className="text-[10px] text-slate-500 block">{bk.packageName} ({bk.travelType})</span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-300 block">{bk.travelStartDate}</span>
                          <span className="text-[10px] text-slate-500 block">{bk.totalDays} Days ({bk.tripStatus})</span>
                        </td>
                        <td className="p-4 text-slate-300">{bk.noOfPax} Pax / {bk.noOfRooms} R</td>
                        <td className="p-4 text-slate-400">{bk.assignedStaff || '—'}</td>
                        <td className="p-4 text-right font-semibold text-emerald-400">₹{bk.bookingAmount?.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-right text-orange-400">₹{(bk.vendorCost || 0).toLocaleString('en-IN')}</td>
                        <td className={`p-4 text-right font-bold ${bk.profit >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>
                          ₹{bk.profit?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            bk.tripStatus === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : bk.tripStatus === 'Cancelled'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : bk.tripStatus === 'Ongoing'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {bk.tripStatus}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEditBooking(bk)}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Edit Booking"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBookingDelete(bk.id, bk.clientName)}
                              className="p-1.5 hover:bg-red-950/40 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete Booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENTS TRACKER TAB */}
      {activeSubTab === 'payments' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-855">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search client payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none w-full sm:w-auto"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Fully Paid</option>
              <option value="Partial">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          {/* Payments Table */}
          <div className="bg-slate-900/40 border border-slate-855 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-855 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Client Name</th>
                    <th className="p-4 text-right">Total Cost (₹)</th>
                    <th className="p-4 text-right">Paid Advance (₹)</th>
                    <th className="p-4 text-right">Balance Due (₹)</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Last Payment Date</th>
                    <th className="p-4">Payment Mode</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-855">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500">
                        No client records found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((bk, idx) => (
                      <tr key={bk.id || idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-400">
                          <span className="block">{(bk.id || '').startsWith('CMT') ? bk.id : (bk.id || '').substring(0, 8) || 'Staged'}</span>
                          {bk.zohoInvoiceNo && (
                            <span className="text-[10px] text-indigo-300 font-sans font-bold block mt-0.5" title="Zoho Invoice Number">
                              📄 {bk.zohoInvoiceNo}
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-white">{bk.clientName}</td>
                        <td className="p-4 text-right font-semibold text-white">₹{bk.bookingAmount?.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-right font-semibold text-emerald-400">₹{(bk.advanceReceived || 0).toLocaleString('en-IN')}</td>
                        <td className={`p-4 text-right font-bold ${bk.balanceAmount > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
                          ₹{(bk.balanceAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-slate-300">{bk.dueDate || '—'}</td>
                        <td className="p-4 text-slate-400">{bk.lastPaymentDate || '—'}</td>
                        <td className="p-4 text-slate-400">{bk.paymentMode || '—'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            bk.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : bk.paymentStatus === 'Partial'
                              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {bk.paymentStatus || 'Unpaid'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setPaymentBooking(bk);
                              setRecordedAmount('');
                              setRecordedMode(bk.paymentMode || 'Bank Transfer');
                              setRecordedRemarks(bk.paymentRemarks || '');
                              setRecordedDueDate(bk.dueDate || '');
                              setShowPaymentRecordModal(true);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer border border-slate-750"
                          >
                            Record Payment
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR TRACKER TAB */}
      {activeSubTab === 'vendors' && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-855">
            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (bookings.length === 0) {
                  showToast('warning', 'No Bookings Available', 'Please create a Booking before logging a vendor bill.');
                  return;
                }
                setEditingVendor(null);
                setVendorBookingId(bookings[0].id);
                setVendorForm({
                  bookingId: bookings[0].id,
                  vendorType: 'Hotel',
                  vendorName: '',
                  contact: '',
                  totalCost: '',
                  paid: '0',
                  status: 'Unpaid',
                  notes: ''
                });
                setShowVendorModal(true);
              }}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow shadow-indigo-900/30 transition-all active:scale-[0.98] w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Vendor Bill
            </button>
          </div>

          {/* Vendors Table */}
          <div className="bg-slate-900/40 border border-slate-855 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-855 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Vendor Type</th>
                    <th className="p-4">Vendor Name</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4 text-right">Total Cost (₹)</th>
                    <th className="p-4 text-right">Paid (₹)</th>
                    <th className="p-4 text-right">Balance (₹)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-855">
                  {filteredVendorPayments.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500">
                        No vendor bills found.
                      </td>
                    </tr>
                  ) : (
                    filteredVendorPayments.map((vp, idx) => {
                      const bk = bookings.find(b => b.id === vp.bookingId);
                      return (
                        <tr key={vp.id || idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-4 font-mono text-[11px]">
                            <span className="text-slate-400 block">{(vp.bookingId || '').startsWith('CMT') ? vp.bookingId : (vp.bookingId || '').substring(0, 8) || 'Staged'}</span>
                            <span className="text-[9px] text-slate-500 block">({bk?.clientName || 'Direct Booking'})</span>
                          </td>
                          <td className="p-4 font-bold text-slate-200">{vp.vendorType}</td>
                          <td className="p-4 font-bold text-white">{vp.vendorName}</td>
                          <td className="p-4 text-slate-400">{vp.contact || '—'}</td>
                          <td className="p-4 text-right font-semibold text-white">₹{vp.totalCost?.toLocaleString('en-IN')}</td>
                          <td className="p-4 text-right font-semibold text-emerald-400">₹{(vp.paid || 0).toLocaleString('en-IN')}</td>
                          <td className={`p-4 text-right font-bold ${vp.balance > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
                            ₹{(vp.balance || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              vp.status === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : vp.status === 'Partial'
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {vp.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 max-w-xs truncate">{vp.notes || '—'}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => openEditVendor(vp)}
                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleVendorDelete(vp)}
                                className="p-1.5 hover:bg-red-950/40 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR DIRECTORY TAB */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-855">
            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search master directory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={masterLocationFilter}
                onChange={(e) => setMasterLocationFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Locations</option>
                {uniqueVendorLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingMasterVendor(null);
                setMasterVendorForm({
                  name: '',
                  location: '',
                  contactPerson: '',
                  phone: '',
                  email: '',
                  notes: ''
                });
                setShowMasterVendorModal(true);
              }}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow shadow-indigo-900/30 transition-all active:scale-[0.98] w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Master Vendor
            </button>
          </div>

          {/* Master Directory Grid */}
          <div className="bg-slate-900/40 border border-slate-855 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-855 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Location</th>
                    <th className="p-4">Vendor Name</th>
                    <th className="p-4">Contact Person</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Notes / Remarks</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-855">
                  {filteredMasterVendors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No master vendors found. Click "Add Master Vendor" to add one.
                      </td>
                    </tr>
                  ) : (
                    filteredMasterVendors.map((mv, idx) => (
                      <tr key={mv.id || idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-bold text-indigo-400">{mv.location}</td>
                        <td className="p-4 font-bold text-white">{mv.name}</td>
                        <td className="p-4 text-slate-300">{mv.contactPerson || '—'}</td>
                        <td className="p-4 font-mono text-slate-300">
                          {mv.phone ? (
                            <a href={`tel:${mv.phone}`} className="hover:underline hover:text-indigo-455">
                              {mv.phone}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-4 font-mono text-slate-350">
                          {mv.email ? (
                            <a href={`mailto:${mv.email}`} className="hover:underline hover:text-indigo-455">
                              {mv.email}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-4 text-slate-400 max-w-xs truncate">{mv.notes || '—'}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEditMasterVendor(mv)}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMasterVendorDelete(mv)}
                              className="p-1.5 hover:bg-red-955/40 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- MODALS -------------------- */}

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-855 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white uppercase tracking-wider mb-5 border-b border-slate-800 pb-2">
              {editingBooking ? 'Edit Booking Details' : 'Add New Booking'}
            </h2>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Row 1: Client details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.clientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={bookingForm.clientPhone}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={bookingForm.clientEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Travel Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Destination *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm({ ...bookingForm, destination: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Package Name</label>
                  <input
                    type="text"
                    value={bookingForm.packageName}
                    onChange={(e) => setBookingForm({ ...bookingForm, packageName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Travel Type</label>
                  <select
                    value={bookingForm.travelType}
                    onChange={(e) => setBookingForm({ ...bookingForm, travelType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Customized">Customized Tour</option>
                    <option value="Group">Group Departure</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Hotel & Rooms */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">No. of Pax</label>
                  <input
                    type="number"
                    value={bookingForm.noOfPax}
                    onChange={(e) => setBookingForm({ ...bookingForm, noOfPax: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">No. of Rooms</label>
                  <input
                    type="number"
                    value={bookingForm.noOfRooms}
                    onChange={(e) => setBookingForm({ ...bookingForm, noOfRooms: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Travel Start Date</label>
                  <input
                    type="date"
                    value={bookingForm.travelStartDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, travelStartDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Travel End Date</label>
                  <input
                    type="date"
                    value={bookingForm.travelEndDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, travelEndDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Accomodation details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Hotel Details</label>
                  <input
                    type="text"
                    value={bookingForm.hotelDetails}
                    onChange={(e) => setBookingForm({ ...bookingForm, hotelDetails: e.target.value })}
                    placeholder="e.g. 2N Gangtok Homestay, 1N Zuluk Homestay"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Meal Plan</label>
                  <input
                    type="text"
                    value={bookingForm.mealPlan}
                    onChange={(e) => setBookingForm({ ...bookingForm, mealPlan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Transport & Pickup</label>
                  <input
                    type="text"
                    value={bookingForm.transportType}
                    onChange={(e) => setBookingForm({ ...bookingForm, transportType: e.target.value })}
                    placeholder="e.g. Bolero Shared / NJP Pickup"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Financials & Bookkeeping */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-indigo-400 uppercase">Total Package Cost *</label>
                  <input
                    type="number"
                    required
                    value={bookingForm.totalPackageCost}
                    onChange={(e) => setBookingForm({ ...bookingForm, totalPackageCost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none"
                  />
                </div>

                {!editingBooking && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-emerald-400 uppercase">Advance Payment</label>
                    <input
                      type="number"
                      value={bookingForm.advanceReceived}
                      onChange={(e) => setBookingForm({ ...bookingForm, advanceReceived: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Assigned Staff</label>
                  <input
                    type="text"
                    value={bookingForm.assignedStaff}
                    onChange={(e) => setBookingForm({ ...bookingForm, assignedStaff: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Lead Source</label>
                  <input
                    type="text"
                    value={bookingForm.source}
                    onChange={(e) => setBookingForm({ ...bookingForm, source: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Status and dropdowns row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Trip Status</label>
                  <select
                    value={bookingForm.tripStatus}
                    onChange={(e) => setBookingForm({ ...bookingForm, tripStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Ticket Booking Status</label>
                  <select
                    value={bookingForm.ticketStatus}
                    onChange={(e) => setBookingForm({ ...bookingForm, ticketStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Booked">Booked</option>
                    <option value="N/A">Not Applicable</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Voucher Sent</label>
                  <select
                    value={bookingForm.voucherSent}
                    onChange={(e) => setBookingForm({ ...bookingForm, voucherSent: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Payment Due Date</label>
                  <input
                    type="date"
                    value={bookingForm.dueDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Zoho invoice and remarks row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-indigo-400 uppercase">Zoho Invoice Number (Manual)</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-00123"
                    value={bookingForm.zohoInvoiceNo}
                    onChange={(e) => setBookingForm({ ...bookingForm, zohoInvoiceNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Payment Remarks / Details</label>
                  <input
                    type="text"
                    placeholder="e.g. GPay or Bank transfer txn ref..."
                    value={bookingForm.paymentRemarks}
                    onChange={(e) => setBookingForm({ ...bookingForm, paymentRemarks: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Remarks area */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Special Notes / Requests</label>
                <textarea
                  value={bookingForm.specialNotes}
                  onChange={(e) => setBookingForm({ ...bookingForm, specialNotes: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow shadow-indigo-900/40"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT RECORD PAYMENT MODAL */}
      {showPaymentRecordModal && paymentBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-855 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setShowPaymentRecordModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black text-white uppercase tracking-wider mb-4 border-b border-slate-855 pb-2 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-400" />
              Record Client Payment
            </h2>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-855 text-xs text-slate-400 space-y-1 mb-4">
              <div className="flex justify-between">
                <span>Client Name:</span>
                <span className="font-bold text-white">{paymentBooking.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Package Cost:</span>
                <span className="font-semibold text-white">₹{paymentBooking.bookingAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Advance Received:</span>
                <span className="font-semibold text-emerald-400">₹{(paymentBooking.advanceReceived || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-855 mt-1.5 pt-1.5">
                <span>Current Balance Amount:</span>
                <span className="font-bold text-orange-400">₹{(paymentBooking.balanceAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={recordedAmount}
                  onChange={(e) => setRecordedAmount(e.target.value)}
                  placeholder="Enter amount paid"
                  max={paymentBooking.balanceAmount}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Mode</label>
                <select
                  value={recordedMode}
                  onChange={(e) => setRecordedMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                  <option value="UPI">UPI (GPay/PhonePe)</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Next Balance Due Date (If Partial)</label>
                <input
                  type="date"
                  value={recordedDueDate}
                  onChange={(e) => setRecordedDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Remarks / Transaction Details</label>
                <input
                  type="text"
                  value={recordedRemarks}
                  onChange={(e) => setRecordedRemarks(e.target.value)}
                  placeholder="Txn ID, reference, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-855">
                <button
                  type="button"
                  onClick={() => setShowPaymentRecordModal(false)}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR MODAL */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-855 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setShowVendorModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black text-white uppercase tracking-wider mb-5 border-b border-slate-855 pb-2">
              {editingVendor ? 'Edit Vendor Bill' : 'Record Vendor Invoice'}
            </h2>

            <form onSubmit={handleVendorSubmit} className="space-y-4">
              {!editingVendor && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Link to Client Booking *</label>
                  <select
                    value={vendorBookingId}
                    onChange={(e) => {
                      setVendorBookingId(e.target.value);
                      setVendorForm(prev => ({ ...prev, bookingId: e.target.value }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    {bookings.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.clientName} - {b.destination} ({b.id.substring(0, 8)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Load from Master Vendor Directory (Optional)</label>
                <select
                  value=""
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (!selectedId) return;
                    const mv = masterVendors.find(v => v.id === selectedId);
                    if (mv) {
                      const contactString = [
                        mv.contactPerson,
                        mv.phone,
                        mv.email
                      ].filter(Boolean).join(' | ');

                      setVendorForm(prev => ({
                        ...prev,
                        vendorName: mv.name,
                        contact: contactString,
                        vendorType: 'Hotel', // defaults to Hotel accommodation
                        notes: prev.notes ? `${prev.notes}\nMaster Notes: ${mv.notes || ''}` : (mv.notes || '')
                      }));
                    }
                  }}
                  className="w-full bg-slate-950 border border-indigo-950 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose Vendor to Auto-Fill --</option>
                  {uniqueVendorLocations.map(loc => {
                    const locVendors = masterVendors.filter(v => v.location === loc);
                    if (locVendors.length === 0) return null;
                    return (
                      <optgroup key={loc} label={loc} className="bg-slate-900 text-white font-bold">
                        {locVendors.map(v => (
                          <option key={v.id} value={v.id} className="bg-slate-950 text-slate-200 font-sans">
                            {v.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vendor Type</label>
                  <select
                    value={vendorForm.vendorType}
                    onChange={(e) => setVendorForm({ ...vendorForm, vendorType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="Hotel">Hotel Accommodation</option>
                    <option value="Transport">Car / Flight Transport</option>
                    <option value="Local Agent">Local Agent / Operator</option>
                    <option value="Guide">Tour Guide / Permit handler</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={vendorForm.vendorName}
                    onChange={(e) => setVendorForm({ ...vendorForm, vendorName: e.target.value })}
                    placeholder="e.g. Zuluk Homestay Association"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Vendor Contact Details</label>
                <input
                  type="text"
                  value={vendorForm.contact}
                  onChange={(e) => setVendorForm({ ...vendorForm, contact: e.target.value })}
                  placeholder="Phone, email, or contact person"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-orange-400 uppercase">Total Bill Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    value={vendorForm.totalCost}
                    onChange={(e) => setVendorForm({ ...vendorForm, totalCost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-400 uppercase">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={vendorForm.paid}
                    onChange={(e) => setVendorForm({ ...vendorForm, paid: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes / Reference Details</label>
                <textarea
                  value={vendorForm.notes}
                  onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Invoice number, room allotment notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-855">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-white font-sans">
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="bg-indigo-650 px-6 py-4 flex items-center justify-between border-b border-indigo-700">
              <div>
                <h3 className="font-black text-white text-base">Bulk Import Bookings</h3>
                <p className="text-indigo-200 text-[11px] mt-0.5">Upload a CSV file to update or create historical logs</p>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-700/50 hover:bg-indigo-700 text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
                <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider">CSV Data Template</h4>
                <p className="text-xs text-slate-400">Download the required spreadsheet template to format your historical booking data correctly before uploading.</p>
                <div className="pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const templateHeaders = [
                        'Booking ID', 'Client Name', 'Client Phone', 'Client Email', 'Source', 
                        'Destination', 'Package Name', 'Travel Type', 'No of Pax', 'No of Rooms', 
                        'Travel Start Date', 'Travel End Date', 'Booking Amount', 'Advance Received', 
                        'Vendor Cost', 'Assigned Staff', 'Voucher Sent', 'Ticket Status', 'Trip Status'
                      ].join(',');
                      const dummyData = 'local-booking-example,John Doe,+91 9876543210,john@example.com,Affiliate,Kashmir Tour,Kashmir Deluxe,Customized,2,1,2026-07-15,2026-07-22,35000,15000,18000,Staff A,Yes,Booked,Upcoming';
                      const csv = templateHeaders + '\n' + dummyData;
                      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', 'bookings_import_template.csv');
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <span>↓ Download CSV Template</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 rounded-2xl p-8 text-center transition-all">
                <input
                  type="file"
                  accept=".csv"
                  id="csv-file-upload-modal"
                  onChange={(e) => {
                    handleCSVUpload(e);
                    setShowBulkModal(false);
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file-upload-modal"
                  className="px-6 py-3 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow shadow-indigo-900/40"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose CSV Spreadsheet</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-3 max-w-xs">Supports automatic customer profile lookup and matching by Booking ID, Email, or Name.</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-slate-955 border border-slate-805 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MASTER VENDOR DIRECTORY MODAL */}
      {showMasterVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-855 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-scale-up text-left">
            <button
              onClick={() => setShowMasterVendorModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white mb-1.5">
              {editingMasterVendor ? 'Edit Master Vendor' : 'Add Master Vendor'}
            </h2>
            <p className="text-slate-400 text-xs mb-6 border-b border-slate-800 pb-3">
              Configure master records to automatically pull info when logging bills.
            </p>

            <form onSubmit={handleMasterVendorSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Srinagar or Kashmir"
                    value={masterVendorForm.location}
                    onChange={(e) => setMasterVendorForm({ ...masterVendorForm, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Plaza Hotel"
                    value={masterVendorForm.name}
                    onChange={(e) => setMasterVendorForm({ ...masterVendorForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Manager Mr. Sharma"
                  value={masterVendorForm.contactPerson}
                  onChange={(e) => setMasterVendorForm({ ...masterVendorForm, contactPerson: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-655 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9900088000"
                    value={masterVendorForm.phone}
                    onChange={(e) => setMasterVendorForm({ ...masterVendorForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-655 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. vendor@hotel.com"
                    value={masterVendorForm.email}
                    onChange={(e) => setMasterVendorForm({ ...masterVendorForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-655 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Notes / Remarks</label>
                <textarea
                  placeholder="Add any extra notes, contract rates, check-in instructions..."
                  value={masterVendorForm.notes}
                  onChange={(e) => setMasterVendorForm({ ...masterVendorForm, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none resize-none placeholder-slate-655 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMasterVendorModal(false)}
                  className="px-4 py-2.5 bg-slate-850 border border-slate-750 text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow shadow-indigo-900/40"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
