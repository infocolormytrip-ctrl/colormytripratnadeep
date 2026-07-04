import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { TravelPackage, BlogPost, OfferMarqueeItem, Enquiry, CustomTemplate, ScheduledEmail, EmailAttachment } from '../types';
import { 
  Inbox, 
  Plus, 
  Trash2, 
  X, 
  Globe,
  Database,
  BookOpen,
  Lock,
  Sparkles,
  Video,
  Save,
  Upload,
  Pencil,
  Megaphone,
  Palette,
  Timer,
  Link2,
  Image as ImageIcon,
  Star,
  MessageSquare,
  ChevronDown,
  LogOut,
  Mail,
  Clock,
  Paperclip
} from 'lucide-react';
import { Review } from '../types';

// ─── Reviews Panel Sub-component ──────────────────────────────────────────────
interface ReviewsPanelProps {
  reviews: Review[];
  addReview: (r: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  deleteReview: (id: string) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, msg?: string) => void;
}

function ReviewsPanel({ reviews, addReview, deleteReview, showToast }: ReviewsPanelProps) {
  const [showForm, setShowForm] = React.useState(false);
  const [rName, setRName] = React.useState('');
  const [rRating, setRRating] = React.useState(5);
  const [rSource, setRSource] = React.useState('Google Review');
  const [rComment, setRComment] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [hoverStar, setHoverStar] = React.useState(0);

  const resetForm = () => {
    setRName(''); setRRating(5); setRSource('Google Review'); setRComment('');
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName.trim() || !rComment.trim()) {
      showToast('error', 'Missing fields', 'Name and review text are required.');
      return;
    }
    setSaving(true);
    try {
      await addReview({ name: rName.trim(), rating: rRating, source: rSource, comment: rComment.trim() });
      showToast('success', 'Review Added', `"${rName.trim()}" has been published.`);
      resetForm();
    } catch {
      showToast('error', 'Failed to add review', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete review by "${name}"? This cannot be undone.`)) return;
    try {
      await deleteReview(id);
      showToast('success', 'Review Deleted', `Review by "${name}" removed.`);
    } catch {
      showToast('error', 'Delete failed', 'Please try again.');
    }
  };

  const sources = ['Google Review', 'Facebook', 'Verified Customer', 'TripAdvisor', 'Instagram', 'WhatsApp'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-white">Written Reviews</h3>
          <p className="text-slate-400 text-xs mt-0.5">Manage customer reviews displayed on the website ({reviews.length} total)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      {/* Add Review Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 to-slate-900">
              <div>
                <h4 className="text-sm font-black text-white">Add Customer Review</h4>
                <p className="text-slate-400 text-xs">This review will appear on the website immediately</p>
              </div>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Customer Name *</label>
                <input
                  type="text"
                  value={rName}
                  onChange={(e) => setRName(e.target.value)}
                  placeholder="e.g. Anirban Sen, Kolkata"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  required
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Rating *</label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRRating(s)}
                      onMouseEnter={() => setHoverStar(s)}
                      onMouseLeave={() => setHoverStar(0)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`w-7 h-7 transition-colors ${s <= (hoverStar || rRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-amber-400 font-bold">{rRating}/5</span>
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Source / Platform *</label>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRSource(s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        rSource === s
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Review Text *</label>
                <textarea
                  value={rComment}
                  onChange={(e) => setRComment(e.target.value)}
                  rows={4}
                  placeholder="Write the customer review here..."
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-500 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-800">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60">
                  {saving ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="p-16 text-center bg-slate-900 rounded-2xl border border-slate-800">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">No reviews yet. Add your first customer review!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative hover:border-slate-700 transition-colors group">
              {/* Delete button */}
              <button
                onClick={() => handleDelete(rev.id, rev.name)}
                className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-lg hover:bg-slate-800"
                aria-label="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                ))}
              </div>

              {/* Comment */}
              <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed mb-4 italic line-clamp-4">
                "{rev.comment}"
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <p className="text-white font-bold text-xs">{rev.name}</p>
                  {rev.createdAt && <p className="text-slate-500 text-[10px] mt-0.5">{rev.createdAt}</p>}
                </div>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-md border border-slate-700">
                  {rev.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Emails Desk Panel Sub-component ──────────────────────────────────────────
interface EmailsPanelProps {
  enquiries: Enquiry[];
  customTemplates: CustomTemplate[];
  scheduledEmails: ScheduledEmail[];
  saveCustomTemplate: (t: Omit<CustomTemplate, 'id' | 'createdAt'>) => Promise<CustomTemplate>;
  deleteCustomTemplate: (id: string) => Promise<void>;
  scheduleEmail: (e: Omit<ScheduledEmail, 'id' | 'createdAt' | 'status'>) => Promise<ScheduledEmail>;
  deleteScheduledEmail: (id: string) => Promise<void>;
  updateScheduledEmailStatus: (id: string, status: 'sent' | 'failed', error?: string) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, msg?: string) => void;
  packages: TravelPackage[];
}

function EmailsPanel({
  enquiries,
  customTemplates,
  scheduledEmails,
  saveCustomTemplate,
  deleteCustomTemplate,
  scheduleEmail,
  deleteScheduledEmail,
  updateScheduledEmailStatus,
  showToast,
  packages,
}: EmailsPanelProps) {
  const [selectedEnqId, setSelectedEnqId] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [selectedTmplKey, setSelectedTmplKey] = useState('ack');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [tabView, setTabView] = useState<'compose' | 'scheduled' | 'templates'>('compose');

  // Custom template modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplSubject, setNewTmplSubject] = useState('');
  const [newTmplHtml, setNewTmplHtml] = useState('');
  const [savingTmpl, setSavingTmpl] = useState(false);
  const [runningQueue, setRunningQueue] = useState(false);

  const selectedEnquiry = useMemo(() => enquiries.find(e => e.id === selectedEnqId), [selectedEnqId, enquiries]);

  const handleDropdownSelect = (enqId: string) => {
    setSelectedEnqId(enqId);
    const enq = enquiries.find(e => e.id === enqId);
    if (enq && enq.email) {
      setRecipientEmails((prev) => {
        const current = prev.split(',').map((s) => s.trim()).filter(Boolean);
        if (!current.includes(enq.email)) {
          current.push(enq.email);
        }
        return current.join(', ');
      });
    }
  };

  // Default templates pre-population helper
  const getTemplateContent = useCallback((key: string, enq?: Enquiry) => {
    const guestName = enq?.name || 'Customer';
    const destination = enq?.destination || 'Your Destination';
    const travelDate = enq?.travelDate || 'Flexible / To Be Decided';
    const duration = packages.find(p => p.id === enq?.packageId)?.duration || 'Custom Plan';
    const travellers = enq?.travelers ? `${enq.travelers} Pax` : '1 Pax';
    const enquiryId = enq?.id || 'N/A';
    const currentYear = new Date().getFullYear();

    if (key === 'ack') {
      return {
        subject: `✈️ ColorMyTrip Enquiry Received! - ID: ${enquiryId}`,
        html: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,sans-serif;color:#333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fa;padding:30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
          <tr>
            <td align="center" style="background:#0f4c81;padding:35px 20px;color:#fff;">
              <h1 style="margin:0 0 5px;font-size:26px;">Thank You!</h1>
              <p style="margin:0;font-size:15px;color:#dbefff;">We've successfully received your travel request</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 40px 10px;">
              <p>Dear <strong>${guestName}</strong>,</p>
              <p>Thank you for choosing <strong>ColorMyTrip</strong>! We have received your request and our travel experts are currently designing your custom itinerary.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 40px;">
              <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #e5e7eb;background:#fafafa;border-radius:8px;">
                <tr><td width="40%"><strong>Destination</strong></td><td>${destination}</td></tr>
                <tr><td><strong>Travel Date</strong></td><td>${travelDate}</td></tr>
                <tr><td><strong>Duration</strong></td><td>${duration}</td></tr>
                <tr><td><strong>Travellers</strong></td><td>${travellers}</td></tr>
                <tr><td><strong>Enquiry ID</strong></td><td>${enquiryId}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:30px 40px 40px;">
              <a href="https://wa.me/919748345171" style="background:#25D366;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">Chat on WhatsApp</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
      };
    }

    if (key === 'pdf-pack') {
      return {
        subject: `🏔️ Your Customized Tour Itinerary - ColorMyTrip`,
        html: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;padding:20px;">
  <h2>Hello ${guestName},</h2>
  <p>We are delighted to share the customized travel itinerary and sightseeing details designed for your upcoming trip to <strong>${destination}</strong>.</p>
  <p><strong>Please find the attached PDF itinerary</strong> at the bottom of this email. It contains complete details including day-wise itinerary, homestays/hotels configuration, inclusions, exclusions, and taxi service parameters.</p>
  <p>Feel free to request any adjustments! We are happy to modify the plans to match your choices.</p>
  <br/>
  <p>Warm regards,<br/><strong>Team ColorMyTrip</strong></p>
</body>
</html>`
      };
    }

    if (key === 'pdf-inv') {
      return {
        subject: `🧾 Booking Confirmation & Invoice - ColorMyTrip`,
        html: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;padding:20px;">
  <h2>Dear ${guestName},</h2>
  <p>We have officially confirmed your travel booking for <strong>${destination}</strong>! Thank you for choosing us as your trusted travel partner.</p>
  <p><strong>Please find the attached Invoice PDF</strong> containing details of the package, advance payment status, cumulative balance amount, and banking coordinates for your convenience.</p>
  <p>Should you require any amendments or updates, please reach out to us directly.</p>
  <br/>
  <p>Best regards,<br/><strong>ColorMyTrip Accounts Desk</strong></p>
</body>
</html>`
      };
    }

    if (key === 'review') {
      return {
        subject: `⭐️ Share Your ColorMyTrip Experience!`,
        html: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;padding:20px;">
  <h2>Welcome back, ${guestName}!</h2>
  <p>We hope you had a magical experience on your trip to <strong>${destination}</strong>. It was a pleasure organizing your travel arrangements.</p>
  <p>Could you take 1 minute to share your feedback and rate us on Google? Your reviews help fellow travelers discover our services and motivate our team.</p>
  <div style="margin:20px 0;">
    <a href="https://share.google/NSftxjF26hqL9dupt" style="background:#0f4c81;color:#ffffff;text-decoration:none;padding:12px 25px;border-radius:6px;font-weight:bold;display:inline-block;">Leave a Google Review ⭐️</a>
  </div>
  <p>Thank you once again for traveling with us!</p>
  <br/>
  <p>With gratitude,<br/><strong>ColorMyTrip Team</strong></p>
</body>
</html>`
      };
    }

    return { subject: '', html: '' };
  }, [packages]);

  // Load template content when enquiry or template selector shifts
  useEffect(() => {
    if (selectedTmplKey.startsWith('custom-')) {
      const customId = selectedTmplKey.replace('custom-', '');
      const ct = customTemplates.find(t => t.id === customId);
      if (ct) {
        let parsedHtml = ct.html;
        let parsedSubject = ct.subject;
        if (selectedEnquiry) {
          const duration = packages.find(p => p.id === selectedEnquiry.packageId)?.duration || 'Custom Plan';
          const travelersText = selectedEnquiry.travelers ? `${selectedEnquiry.travelers} Pax` : '1 Pax';
          
          const replacer = (text: string) => {
            return text
              .replaceAll('{{guestName}}', selectedEnquiry.name || '')
              .replaceAll('{{destination}}', selectedEnquiry.destination || '')
              .replaceAll('{{enquiryId}}', selectedEnquiry.id || '')
              .replaceAll('{{guestEmail}}', selectedEnquiry.email || '')
              .replaceAll('{{guestPhone}}', selectedEnquiry.phone || '')
              .replaceAll('{{travelDate}}', selectedEnquiry.travelDate || '')
              .replaceAll('{{travelers}}', travelersText)
              .replaceAll('{{duration}}', duration)
              .replaceAll('{{message}}', selectedEnquiry.message || '');
          };

          parsedHtml = replacer(parsedHtml);
          parsedSubject = replacer(parsedSubject);
        }
        setEmailSubject(parsedSubject);
        setEmailBody(parsedHtml);
      }
    } else {
      const resolved = getTemplateContent(selectedTmplKey, selectedEnquiry);
      setEmailSubject(resolved.subject);
      setEmailBody(resolved.html);
    }
  }, [selectedTmplKey, selectedEnquiry, customTemplates, getTemplateContent]);

  // Read uploaded files and convert to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 3.2 * 1024 * 1024) {
        showToast('error', 'File Too Large', `"${file.name}" exceeds the 3MB server limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            content: base64Data,
            contentType: file.type || 'application/octet-stream',
          },
        ]);
        showToast('info', 'File Attached', `"${file.name}" added successfully.`);
      };
      reader.onerror = () => {
        showToast('error', 'Attachment Failed', `Could not process "${file.name}".`);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ''; // Reset input element
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCustomHtmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const htmlText = event.target?.result as string;
      setNewTmplHtml(htmlText);
      showToast('info', 'Template Parsed', `HTML from "${file.name}" loaded into editor.`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveCustomTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTmplName.trim() || !newTmplSubject.trim() || !newTmplHtml.trim()) {
      showToast('error', 'Missing Fields', 'Please complete all fields.');
      return;
    }
    setSavingTmpl(true);
    try {
      await saveCustomTemplate({
        name: newTmplName.trim(),
        subject: newTmplSubject.trim(),
        html: newTmplHtml.trim(),
      });
      showToast('success', 'Template Saved', `"${newTmplName}" added to template list.`);
      setNewTmplName(''); setNewTmplSubject(''); setNewTmplHtml('');
      setShowTemplateModal(false);
    } catch {
      showToast('error', 'Save Failed', 'Could not save template.');
    } finally {
      setSavingTmpl(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Delete custom template "${name}"?`)) return;
    try {
      await deleteCustomTemplate(id);
      showToast('success', 'Template Deleted', 'Custom template removed.');
      if (selectedTmplKey === `custom-${id}`) setSelectedTmplKey('ack');
    } catch {
      showToast('error', 'Delete Failed', 'Failed to remove template.');
    }
  };

  const handleSendOrSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmails.trim()) {
      showToast('error', 'Validation Error', 'Please enter at least one recipient email.');
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      showToast('error', 'Validation Error', 'Subject and content are required.');
      return;
    }

    if (sendMode === 'schedule') {
      if (!scheduleDateTime) {
        showToast('error', 'Validation Error', 'Please choose a schedule date and time.');
        return;
      }
      const targetTime = new Date(scheduleDateTime).getTime();
      if (targetTime <= Date.now()) {
        showToast('error', 'Validation Error', 'Scheduled time must be in the future.');
        return;
      }

      setSending(true);
      try {
        await scheduleEmail({
          to: recipientEmails.trim(),
          subject: emailSubject.trim(),
          html: emailBody,
          sendAt: new Date(scheduleDateTime).toISOString(),
          attachments: attachments.length ? attachments : undefined,
        });
        showToast('success', 'Email Scheduled', `Queued to send on ${new Date(scheduleDateTime).toLocaleString()}.`);
        // Reset compose fields
        setAttachments([]);
        setScheduleDateTime('');
      } catch (err) {
        showToast('error', 'Scheduling Failed', 'Could not queue scheduled email.');
      } finally {
        setSending(false);
      }
    } else {
      // Send immediately
      setSending(true);
      try {
        const response = await fetch('/api/send-custom-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipientEmails.trim(),
            subject: emailSubject.trim(),
            html: emailBody,
            attachments: attachments.length ? attachments : undefined,
          }),
        });
        const result = await response.json();
        if (response.ok && result.success) {
          showToast('success', 'Email Dispatched', `Direct email delivered to ${recipientEmails.trim()}.`);
          setAttachments([]);
        } else {
          showToast('error', 'Send Failed', result.error || 'Server rejected SMTP delivery.');
        }
      } catch (err) {
        showToast('error', 'Network Error', 'Direct send API request failed.');
      } finally {
        setSending(false);
      }
    }
  };

  const handleCancelScheduled = async (id: string) => {
    if (!confirm('Cancel this scheduled email dispatch?')) return;
    try {
      await deleteScheduledEmail(id);
      showToast('success', 'Email Canceled', 'Scheduled task successfully purged.');
    } catch {
      showToast('error', 'Cancel Failed', 'Could not remove scheduled task.');
    }
  };

  const handleRunQueueManually = async () => {
    const nowStr = new Date().toISOString();
    const pending = scheduledEmails.filter(e => e.status === 'pending' && e.sendAt <= nowStr);

    if (pending.length === 0) {
      showToast('info', 'Queue Empty', 'No pending scheduled emails are due for delivery yet.');
      return;
    }

    if (!confirm(`Process and dispatch ${pending.length} pending email(s) immediately?`)) return;

    setRunningQueue(true);
    let successCount = 0;
    let failCount = 0;

    for (const email of pending) {
      try {
        const response = await fetch('/api/send-custom-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email.to,
            subject: email.subject,
            html: email.html,
            attachments: email.attachments && email.attachments.length ? email.attachments : undefined,
          }),
        });
        const result = await response.json();
        if (response.ok && result.success) {
          await updateScheduledEmailStatus(email.id, 'sent');
          successCount++;
        } else {
          await updateScheduledEmailStatus(email.id, 'failed', result.error || 'SMTP delivery rejected.');
          failCount++;
        }
      } catch (err) {
        await updateScheduledEmailStatus(email.id, 'failed', String(err));
        failCount++;
      }
    }

    setRunningQueue(false);
    showToast(
      failCount === 0 ? 'success' : 'warning',
      'Execution Complete',
      `Processed ${successCount + failCount} email(s). Sent: ${successCount}, Failed: ${failCount}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub-Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <span>Admin Email Desk</span>
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">Send custom HTML alerts, itineraries, invoice updates, or review links</p>
        </div>
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['compose', 'scheduled', 'templates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabView(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                tabView === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'scheduled' ? `Scheduled (${scheduledEmails.filter(e => e.status === 'pending').length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Compose Tab Layout */}
      {tabView === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Settings Column */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Mail Settings</h4>

            {/* Target Enquiry Select */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Select Guest / Enquiry</label>
              <div className="relative">
                <select
                  value={selectedEnqId}
                  onChange={(e) => handleDropdownSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-950 text-white">-- Choose Guest (Appends Email) --</option>
                  {enquiries.map((enq) => (
                    <option key={enq.id} value={enq.id} className="bg-slate-950 text-white">
                      {enq.name} ({enq.destination})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Recipient Email Input Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Recipient Email(s) *</label>
              <input
                type="text"
                value={recipientEmails}
                onChange={(e) => setRecipientEmails(e.target.value)}
                placeholder="e.g. guest1@gmail.com, guest2@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                required
              />
              <span className="text-[9px] text-slate-500 block mt-1">Type custom emails directly (comma-separated for multiples) or pick from the dropdown to append.</span>
            </div>

            {/* Template Select */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Select Template *</label>
              <div className="relative">
                <select
                  value={selectedTmplKey}
                  onChange={(e) => setSelectedTmplKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <optgroup label="Default System Templates" className="bg-slate-950 text-white">
                    <option value="ack" className="bg-slate-950 text-white">Inquiry Acknowledgement Template</option>
                    <option value="pdf-pack" className="bg-slate-950 text-white">Custom Itinerary PDF Carrier</option>
                    <option value="pdf-inv" className="bg-slate-950 text-white">Booking Confirmation & Invoice Carrier</option>
                    <option value="review" className="bg-slate-950 text-white">Google Review Request Carrier</option>
                  </optgroup>
                  {customTemplates.length > 0 && (
                    <optgroup label="Custom Uploaded Templates" className="bg-slate-950 text-white">
                      {customTemplates.map((t) => (
                        <option key={t.id} value={`custom-${t.id}`} className="bg-slate-950 text-white">
                          {t.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Send Settings */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Dispatch Schedule *</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-850">
                <button
                  type="button"
                  onClick={() => setSendMode('now')}
                  className={`py-2 rounded-md text-[11px] font-extrabold cursor-pointer transition-colors ${
                    sendMode === 'now' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Send Immediately
                </button>
                <button
                  type="button"
                  onClick={() => setSendMode('schedule')}
                  className={`py-2 rounded-md text-[11px] font-extrabold cursor-pointer transition-colors ${
                    sendMode === 'schedule' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Schedule Later
                </button>
              </div>
            </div>

            {/* Date-time picker */}
            {sendMode === 'schedule' && (
              <div className="animate-fadeIn">
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Choose Send Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  required
                />
              </div>
            )}

            {/* File Attachment Uploader */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload PDF Attachments</span>
              </label>
              <div className="relative border border-dashed border-slate-800 rounded-lg p-4 bg-slate-950/60 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-bold">
                  Click to select files (Max 3MB each)
                </span>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-950 border border-slate-850 p-2 rounded-lg text-[10px] font-semibold text-white">
                      <span className="truncate max-w-[200px]">{att.filename}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider text-[9px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Editor Column */}
          <form onSubmit={handleSendOrSchedule} className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Compose Mail Body</h4>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Email Subject *</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="e.g. Action Required: Your ColorMyTrip Booking details inside"
                className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-lg text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                required
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-slate-400">Email HTML Body Content *</label>
                <span className="text-[9px] font-mono text-indigo-400">Placeholders: {'{{guestName}}'}, {'{{destination}}'}, {'{{enquiryId}}'}, {'{{travelDate}}'}, {'{{travelers}}'}, {'{{duration}}'}</span>
              </div>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={16}
                placeholder="Enter customized HTML content..."
                className="w-full bg-slate-950 border border-slate-800 text-xs font-mono p-3 rounded-lg text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 resize-none"
                required
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="submit"
                disabled={sending || !selectedEnquiry}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/50"
              >
                {sending ? 'Processing...' : sendMode === 'schedule' ? 'Queue Scheduled Mail' : 'Dispatch Email Now'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Scheduled Tab Layout */}
      {tabView === 'scheduled' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-slate-800">
            <div>
              <h4 className="text-xs font-black text-white">Pending Scheduled Queue</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Vercel Hobby crons run daily. Run manually below at any time.</p>
            </div>
            <button
              onClick={handleRunQueueManually}
              disabled={runningQueue}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
            >
              {runningQueue ? 'Processing...' : 'Run Queue Dispatcher ⚡'}
            </button>
          </div>
          {scheduledEmails.filter(e => e.status === 'pending').length === 0 ? (
            <div className="text-center p-12 text-slate-500 text-sm">No emails currently scheduled.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-bold">To</th>
                    <th className="pb-3 font-bold">Subject</th>
                    <th className="pb-3 font-bold">Created Date</th>
                    <th className="pb-3 font-bold">Send Time</th>
                    <th className="pb-3 font-bold">Attachments</th>
                    <th className="pb-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {scheduledEmails
                    .filter(e => e.status === 'pending')
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/20">
                        <td className="py-3.5 font-bold text-white">{item.to}</td>
                        <td className="py-3.5 max-w-[200px] truncate">{item.subject}</td>
                        <td className="py-3.5">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 text-indigo-400 font-extrabold">{new Date(item.sendAt).toLocaleString()}</td>
                        <td className="py-3.5">{item.attachments?.length || 0} Files</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleCancelScheduled(item.id)}
                            className="p-1.5 text-rose-400 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                            title="Cancel email schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab Layout */}
      {tabView === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Custom Templates</h4>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Upload Template
            </button>
          </div>

          {customTemplates.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
              No custom templates uploaded yet. Upload a `.html` file or write one to start!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customTemplates.map((tmpl) => (
                <div key={tmpl.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative flex flex-col justify-between group hover:border-slate-700 transition-colors">
                  <div>
                    <h5 className="text-white font-bold text-sm mb-1">{tmpl.name}</h5>
                    <p className="text-slate-400 text-xs mb-3 italic">Subj: {tmpl.subject}</p>
                    <div className="bg-slate-950 p-2 rounded-lg max-h-32 overflow-hidden text-[9px] font-mono text-slate-500 border border-slate-850">
                      {tmpl.html.slice(0, 300)}...
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500">{new Date(tmpl.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDeleteTemplate(tmpl.id, tmpl.name)}
                      className="text-red-400 hover:text-red-300 font-extrabold text-[10px] tracking-wider uppercase cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Custom HTML Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 to-slate-900">
              <div>
                <h4 className="text-sm font-black text-white">Create Custom Email Template</h4>
                <p className="text-slate-400 text-xs">Save HTML layout designs for guest dispatching</p>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCustomTemplate} className="p-6 space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Template Label / Name *</label>
                <input
                  type="text"
                  value={newTmplName}
                  onChange={(e) => setNewTmplName(e.target.value)}
                  placeholder="e.g. Kashmir Winter Group Tour Layout"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Default Email Subject *</label>
                <input
                  type="text"
                  value={newTmplSubject}
                  onChange={(e) => setNewTmplSubject(e.target.value)}
                  placeholder="e.g. Your Kashmir Tour Plan is Ready!"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  required
                />
              </div>

              {/* Upload HTML File Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Upload .html Template File (Optional)</label>
                <div className="relative border border-dashed border-slate-700 rounded-lg p-4 bg-slate-800 text-center hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept=".html"
                    onChange={handleCustomHtmlUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 font-bold">
                    Click to select .html file
                  </span>
                </div>
              </div>

              {/* HTML Editor */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Or Paste Raw HTML Code *</label>
                <textarea
                  value={newTmplHtml}
                  onChange={(e) => setNewTmplHtml(e.target.value)}
                  rows={8}
                  placeholder="Paste HTML source code here..."
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-mono p-3 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-500 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="flex-1 px-4 py-2.5 bg-slate-850 border border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" disabled={savingTmpl} className="flex-1 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60">
                  {savingTmpl ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { 
    showToast,
    packages, 
    blogs, 
    enquiries, 
    videoTestimonials,
    offers,
    affiliates,
    promoCodes,
    reviews,
    addReview,
    deleteReview,
    isAdminLoggedIn, 
    isFirebaseActive, 
    createPackage, 
    updatePackage,
    deletePackage,
    updateEnquiryStatus,
    logout,
    loginWithGoogle,
    localAdminBypass,
    updateEnquiryFields,
    deleteEnquiry,
    createBlog,
    updateBlog,
    deleteBlog,
    addVideoTestimonial,
    deleteVideoTestimonial,
    createOffer,
    updateOffer,
    deleteOffer,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    customTemplates,
    scheduledEmails,
    saveCustomTemplate,
    deleteCustomTemplate,
    scheduleEmail,
    deleteScheduledEmail,
    updateScheduledEmailStatus,

    // CMS settings
    footerSettings,
    contactSettings,
    siteBrandSettings,
    netaTagsSettings,
    updateFooterSettings,
    updateContactSettings,
    updateSiteBrandSettings,
    updateNetaTagsSettings,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useData();

  // Active view tabs
  const [panelTab, setPanelTab] = useState<'enquiries' | 'packages' | 'blogs' | 'offers' | 'videos' | 'promoCodes' | 'website' | 'reviews' | 'emails'>('enquiries');
  
  // Status filters for enquiries
  const [enqFilter, setEnqFilter] = useState<string>('all');
 
  // Search query for enquiries
  const [enqSearch, setEnqSearch] = useState<string>('');
 
  // Rule 9 states and handlers
  const [tempFinalAmounts, setTempFinalAmounts] = useState<Record<string, string>>({});
 
  // Load tab from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['enquiries', 'packages', 'blogs', 'offers', 'videos', 'promoCodes', 'website', 'reviews', 'emails'].includes(tab)) {
      setPanelTab(tab as any);
    }
  }, []);

  const handleStatusChange = async (enqId: string, status: any) => {
    try {
      await updateEnquiryFields(enqId, { status });
      showToast('success', 'Status Updated', `Booking status changed to "${status}" successfully.`);
    } catch (e) {
      showToast('error', 'Status Update Failed', String(e));
    }
  };

  const handleSaveFinalAmount = async (enqId: string, value: string) => {
    try {
      const finalAmt = value.trim() === '' ? null : Number(value);
      await updateEnquiryFields(enqId, { finalNegotiatedAmount: finalAmt });
      setTempFinalAmounts((prev) => {
        const next = { ...prev };
        delete next[enqId];
        return next;
      });
      showToast('success', 'Negotiated Amount Saved', 'Final negotiated amount has been saved successfully.');
    } catch (e) {
      showToast('error', 'Save Failed', String(e));
    }
  };

  const handleCommissionStatusChange = async (enqId: string, commissionStatus: any) => {
    try {
      await updateEnquiryFields(enqId, { commissionStatus });
      showToast('success', 'Commission Updated', `Commission status updated to "${commissionStatus}".`);
    } catch (e) {
      showToast('error', 'Commission Update Failed', String(e));
    }
  };

  // Modal open flags
  const [showPkgAdd, setShowPkgAdd] = useState(false);
  const [showBlogAdd, setShowBlogAdd] = useState(false);
  const [showVideoAdd, setShowVideoAdd] = useState(false);
  const [showPkgBulkAdd, setShowPkgBulkAdd] = useState(false);
  const [showOfferAdd, setShowOfferAdd] = useState(false);

  // Package submission form state
  const [pTitle, setPTitle] = useState('');
  const [pCat, setPCat] = useState<'domestic' | 'international' | 'trekking'>('domestic');
  const [pPrice, setPPrice] = useState('');
  const [pDuration, setPDuration] = useState('');
  const [pLoc, setPLoc] = useState('');
  const [pImage, setPImage] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pInclusions, setPInclusions] = useState('');
  const [pExclusions, setPExclusions] = useState('');
  const [pItinerary, setPItinerary] = useState('');
  const [pFeatured, setPFeatured] = useState(true);
  const [bulkPkgJson, setBulkPkgJson] = useState('');
  const [pkgEditingId, setPkgEditingId] = useState<string | null>(null);

  // Blog submission form state
  const [bTitle, setBTitle] = useState('');
  const [bExcerpt, setBExcerpt] = useState('');
  const [bContent, setBContent] = useState('');
  const [bImage, setBImage] = useState('');
  const [bAuthor, setBAuthor] = useState('');
  const [bTags, setBTags] = useState('');
  const [blogEditingId, setBlogEditingId] = useState<string | null>(null);

  // WordPress-style Rich Text Editor ref and utilities
  const blogEditorRef = React.useRef<HTMLDivElement>(null);

  const executeEditorCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (blogEditorRef.current) {
      setBContent(blogEditorRef.current.innerHTML);
    }
  };

  const addEditorLink = () => {
    const url = prompt('Enter the link URL (e.g., https://example.com):');
    if (url) {
      const fullUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      executeEditorCommand('createLink', fullUrl);
    }
  };

  const addEditorImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) {
      const html = `<img src="${url}" class="rounded-xl max-w-full my-6 shadow-md inline-block" alt="Blog Image" />`;
      executeEditorCommand('insertHTML', html);
    }
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setBContent(e.currentTarget.innerHTML);
  };

  useEffect(() => {
    if (showBlogAdd && blogEditorRef.current) {
      if (blogEditorRef.current.innerHTML !== bContent) {
        blogEditorRef.current.innerHTML = bContent || '<p><br></p>';
      }
    }
  }, [showBlogAdd, blogEditingId]);


  // Video testimonial form state
  const [vName, setVName] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vLocation, setVLocation] = useState('');
  const [vVideoUrl, setVVideoUrl] = useState('');
  const [vDuration, setVDuration] = useState('');
  const [offerText, setOfferText] = useState('');
  const [offerActive, setOfferActive] = useState(true);
  const [offerSpeed, setOfferSpeed] = useState('28');
  const [offerBackground, setOfferBackground] = useState('#eef6ff');
  const [offerTextColor, setOfferTextColor] = useState('#334155');
  const [offerEditingId, setOfferEditingId] = useState<string | null>(null);

  const resetPackageForm = () => {
    setPTitle('');
    setPCat('domestic');
    setPPrice('');
    setPDuration('');
    setPLoc('');
    setPImage('');
    setPDesc('');
    setPInclusions('');
    setPExclusions('');
    setPItinerary('');
    setPFeatured(true);
    setPkgEditingId(null);
  };

  const resetBlogForm = () => {
    setBTitle('');
    setBExcerpt('');
    setBContent('');
    setBImage('');
    setBAuthor('');
    setBTags('');
    setBlogEditingId(null);
    if (blogEditorRef.current) {
      blogEditorRef.current.innerHTML = '<p><br></p>';
    }
  };


  const openPackageEditor = (pkg: TravelPackage) => {
    setPkgEditingId(pkg.id);
    setPTitle(pkg.title);
    setPCat(pkg.category);
    setPPrice(String(pkg.price));
    setPDuration(pkg.duration);
    setPLoc(pkg.location);
    setPImage(pkg.image);
    setPDesc(pkg.description);
    setPInclusions(pkg.inclusions.join('\n'));
    setPExclusions(pkg.exclusions.join('\n'));
    setPItinerary(pkg.itinerary.join('\n'));
    setPFeatured(pkg.featured);
    setShowPkgAdd(true);
  };

  const openBlogEditor = (post: BlogPost) => {
    setBlogEditingId(post.id);
    setBTitle(post.title);
    setBExcerpt(post.excerpt);
    setBContent(post.content);
    setBImage(post.image);
    setBAuthor(post.author);
    setBTags(post.tags.join(', '));
    setShowBlogAdd(true);
  };

  const resetOfferForm = () => {
    setOfferText('');
    setOfferActive(true);
    setOfferSpeed('28');
    setOfferBackground('#eef6ff');
    setOfferTextColor('#334155');
    setOfferEditingId(null);
  };

  const [promoId, setPromoId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoLabel, setPromoLabel] = useState('');
  const [promoDescription, setPromoDescription] = useState('');
  const [promoAffiliateId, setPromoAffiliateId] = useState('');
  const [promoActive, setPromoActive] = useState(true);
  const [promoExpiryDate, setPromoExpiryDate] = useState('');
  const [promoUsageLimit, setPromoUsageLimit] = useState('');
  const [promoCommissionType, setPromoCommissionType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
  const [promoCommissionValue, setPromoCommissionValue] = useState('');
  const [promoApplicablePackages, setPromoApplicablePackages] = useState<string[]>([]);
  const [promoSearch, setPromoSearch] = useState('');

  const resetPromoForm = () => {
    setPromoId(null);
    setPromoCode('');
    setPromoLabel('');
    setPromoDescription('');
    setPromoAffiliateId('');
    setPromoActive(true);
    setPromoExpiryDate('');
    setPromoUsageLimit('');
    setPromoCommissionType('Percentage');
    setPromoCommissionValue('');
    setPromoApplicablePackages([]);
  };

  const editPromo = (promo: any) => {
    setPromoId(promo.id);
    setPromoCode(promo.code || '');
    setPromoLabel(promo.label || '');
    setPromoDescription(promo.description || '');
    setPromoAffiliateId(promo.affiliateId || (Array.isArray(promo.affiliateIds) ? promo.affiliateIds[0] ?? '' : ''));
    setPromoActive(promo.active !== false);
    setPromoExpiryDate(promo.expiryDate ? String(promo.expiryDate).slice(0, 10) : '');
    setPromoUsageLimit(promo.usageLimit != null ? String(promo.usageLimit) : '');
    setPromoCommissionType(promo.commissionType === 'Fixed Amount' ? 'Fixed Amount' : 'Percentage');
    setPromoCommissionValue(promo.commissionValue != null ? String(promo.commissionValue) : '');
    setPromoApplicablePackages(promo.applicablePackages || []);
    setPanelTab('promoCodes');
  };

  const handlePromoSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!promoCode.trim()) {
      showToast('warning', 'Validation Error', 'Promo code is required.');
      return;
    }

    try {
      const payload = {
        code: promoCode.trim(),
        label: promoLabel.trim(),
        description: promoDescription.trim(),
        affiliateId: promoAffiliateId || undefined,
        affiliateIds: promoAffiliateId ? [promoAffiliateId] : [],
        affiliateEmails: [],
        active: promoActive,
        applicablePackages: promoApplicablePackages,
        expiryDate: promoExpiryDate ? promoExpiryDate : undefined,
        usageLimit: promoUsageLimit ? Number(promoUsageLimit) : undefined,
        commissionType: promoCommissionType,
        commissionValue: promoCommissionValue ? Number(promoCommissionValue) : undefined,
      };

      if (promoId) {
        await updatePromoCode(promoId, payload as any);
        showToast('success', 'Promo Code Updated', `Promo code "${payload.code}" updated successfully.`);
      } else {
        await createPromoCode(payload as any);
        showToast('success', 'Promo Code Created', `New promo code "${payload.code}" created successfully.`);
      }
      resetPromoForm();
      setPanelTab('promoCodes');
    } catch (error) {
      console.error(error);
      showToast('error', 'Save Failed', 'Unable to save promo code.');
    }
  };

  // CMS form state
  const [siteLogoUrl, setSiteLogoUrl] = useState('');
  const [footerLogoUrl, setFooterLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

  const [footerDescriptionText, setFooterDescriptionText] = useState('');
  const [footerHeadquartersAddress, setFooterHeadquartersAddress] = useState('');
  const [footerPhoneNumber, setFooterPhoneNumber] = useState('');
  const [footerEmailAddress, setFooterEmailAddress] = useState('');
  const [footerCopyrightText, setFooterCopyrightText] = useState('');

  const [contactEmailAddress, setContactEmailAddress] = useState('');
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');

  const [socialFacebookUrl, setSocialFacebookUrl] = useState('');
  const [socialInstagramUrl, setSocialInstagramUrl] = useState('');
  const [socialTwitterUrl, setSocialTwitterUrl] = useState('');
  const [socialYoutubeUrl, setSocialYoutubeUrl] = useState('');

  const [netaTagsText, setNetaTagsText] = useState('');

  const resetCmsFormFromState = () => {
    setSiteLogoUrl((siteBrandSettings as any)?.site_logo_url || '');
    setFooterLogoUrl((siteBrandSettings as any)?.footer_logo_url || '');
    setFaviconUrl((siteBrandSettings as any)?.favicon_url || '');

    setFooterDescriptionText((footerSettings as any)?.footer_description_text || '');
    setFooterHeadquartersAddress((footerSettings as any)?.headquarters_address || '');
    setFooterPhoneNumber((footerSettings as any)?.phone_number || '');
    setFooterEmailAddress((footerSettings as any)?.email_address || '');
    setFooterCopyrightText((footerSettings as any)?.copyright_text || '');

    setContactEmailAddress((contactSettings as any)?.email_address || '');
    setContactPhoneNumber((contactSettings as any)?.phone_number || '');

    setSocialFacebookUrl((footerSettings as any)?.social_links?.facebook_url || '');
    setSocialInstagramUrl((footerSettings as any)?.social_links?.instagram_url || '');
    setSocialTwitterUrl((footerSettings as any)?.social_links?.twitter_url || '');
    setSocialYoutubeUrl((footerSettings as any)?.social_links?.youtube_url || '');

    const tagsArr: string[] = (netaTagsSettings as any)?.neta_tags || [];
    if (Array.isArray(tagsArr) && tagsArr.length) setNetaTagsText(tagsArr.join(', '));
    else setNetaTagsText((netaTagsSettings as any)?.neta_tags_text || '');
  };

  const openOfferEditor = (offer: OfferMarqueeItem) => {
    setOfferEditingId(offer.id);
    setOfferText(offer.offer_text);
    setOfferActive(offer.is_active);
    setOfferSpeed(String(offer.speed));
    setOfferBackground(offer.background_color);
    setOfferTextColor(offer.text_color);
    setShowOfferAdd(true);
  };

  const submitPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pPrice || !pDuration || !pLoc || !pImage || !pDesc) {
      showToast('warning', 'Validation Error', 'Please fill out all mandatory fields.');
      return;
    }

    try {
      const incList = pInclusions.split('\n').filter(s => s.trim() !== '');
      const excList = pExclusions.split('\n').filter(s => s.trim() !== '');
      const itinList = pItinerary.split('\n').filter(s => s.trim() !== '');

      const payload = {
        title: pTitle,
        category: pCat,
        price: Number(pPrice),
        duration: pDuration,
        location: pLoc,
        image: pImage,
        description: pDesc,
        inclusions: incList.length > 0 ? incList : ['Accommodation included', 'Sightseeing transfers'],
        exclusions: excList.length > 0 ? excList : ['Flights or train ticket costs'],
        itinerary: itinList.length > 0 ? itinList : ['Day 1: Arrival & transfer to hotel', 'Day 2: Full day sightseeing', 'Day 3: Return dropoff'],
        featured: pFeatured
      };

      if (pkgEditingId) {
        await updatePackage(pkgEditingId, payload);
        showToast('success', 'Package Updated', `Package "${payload.title}" updated successfully.`);
      } else {
        await createPackage(payload);
        showToast('success', 'Package Created', `New package "${payload.title}" created successfully.`);
      }

      resetPackageForm();
      setShowPkgAdd(false);
    } catch (err) {
      console.error(err);
      showToast('error', 'Error Saving Package', 'Could not save package to database.');
    }
  };

  const submitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bExcerpt || !bContent || !bImage) {
      showToast('warning', 'Validation Error', 'Please fill out all blog details.');
      return;
    }

    try {
      const tagList = bTags.split(',').map(t => t.trim()).filter(t => t !== '');
      const payload = {
        title: bTitle,
        excerpt: bExcerpt,
        content: bContent,
        image: bImage,
        author: bAuthor || 'ColorMyTrip desk',
        tags: tagList.length > 0 ? tagList : ['Guides', 'Destinations']
      };

      if (blogEditingId) {
        await updateBlog(blogEditingId, payload);
        showToast('success', 'Blog Post Updated', `Blog article "${payload.title}" updated successfully.`);
      } else {
        await createBlog(payload);
        showToast('success', 'Blog Post Published', `New blog article "${payload.title}" published successfully.`);
      }

      resetBlogForm();
      setShowBlogAdd(false);
    } catch (err) {
      console.error(err);
      showToast('error', 'Error Saving Blog', 'Could not publish blog post to database.');
    }
  };

  const submitBulkPackages = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkPkgJson);
      if (!Array.isArray(parsed)) {
        showToast('warning', 'Format Error', 'Bulk payload must be a JSON array.');
        return;
      }

      // Normalize a single itinerary/inclusion/exclusion item (string or object) into a plain string
      const normalizeItem = (item: unknown, index: number, prefix = 'Day'): string => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          // Support common object shapes: {day, title, description}, {title, description}, {activity}, etc.
          const label = obj.day
            ? `${prefix} ${obj.day}`
            : obj.title
            ? String(obj.title)
            : `${prefix} ${index + 1}`;
          const body = obj.description
            ? String(obj.description)
            : obj.details
            ? String(obj.details)
            : obj.activities
            ? String(obj.activities)
            : obj.activity
            ? String(obj.activity)
            : '';
          return body ? `${label}: ${body}` : label;
        }
        return String(item ?? '');
      };

      for (const item of parsed) {
        if (!item.title || !item.category || !item.price || !item.duration || !item.location || !item.image || !item.description) {
          throw new Error(`Invalid package entry: ${JSON.stringify(item).slice(0, 120)}...`);
        }

        await createPackage({
          title: String(item.title),
          category: item.category,
          price: Number(item.price),
          duration: String(item.duration),
          location: String(item.location),
          image: String(item.image),
          description: String(item.description),
          itinerary: Array.isArray(item.itinerary)
            ? item.itinerary.map((d: unknown, i: number) => normalizeItem(d, i, 'Day'))
            : [],
          inclusions: Array.isArray(item.inclusions)
            ? item.inclusions.map((d: unknown, i: number) => normalizeItem(d, i, 'Inclusion'))
            : [],
          exclusions: Array.isArray(item.exclusions)
            ? item.exclusions.map((d: unknown, i: number) => normalizeItem(d, i, 'Exclusion'))
            : [],
          featured: Boolean(item.featured)
        });
      }

      setBulkPkgJson('');
      setShowPkgBulkAdd(false);
      showToast('success', 'Bulk Upload Completed', `Successfully uploaded ${parsed.length} packages.`);
    } catch (error) {
      console.error(error);
      showToast('error', 'Bulk Upload Failed', error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  const submitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerText.trim()) {
      showToast('warning', 'Validation Error', 'Offer text is required.');
      return;
    }

    try {
      const payload = {
        offer_text: offerText.trim(),
        is_active: offerActive,
        speed: Number(offerSpeed) || 28,
        background_color: offerBackground,
        text_color: offerTextColor
      };

      if (offerEditingId) {
        await updateOffer(offerEditingId, payload);
        showToast('success', 'Offer Updated', 'The homepage offer marquee has been updated.');
      } else {
        await createOffer(payload);
        showToast('success', 'Offer Created', 'The new homepage offer marquee has been created.');
      }

      setShowOfferAdd(false);
      resetOfferForm();
    } catch (error) {
      console.error(error);
      showToast('error', 'Error Saving Offer', 'Could not save the offer marquee.');
    }
  };

  const blogPreviewHtml = useMemo(() => {
    return bContent || '<p class="text-slate-400 italic font-normal">Content preview will appear here...</p>';
  }, [bContent]);


  const filteredEnquiries = enquiries.filter((e) => {
    if (e.deleted) return false;
    const currentBookingStatus = e.bookingStatus || e.status;
    const matchesFilter = enqFilter === 'all' || currentBookingStatus === enqFilter;
    if (!matchesFilter) return false;

    const term = enqSearch.trim().toLowerCase();
    if (!term) return true;

    const linkedAff = affiliates?.find(a => a.id === e.affiliateId);
    const affName = linkedAff ? linkedAff.fullName : (e.affiliateName || '');

    return (
      (e.name || '').toLowerCase().includes(term) ||
      (e.email || '').toLowerCase().includes(term) ||
      (e.phone || '').toLowerCase().includes(term) ||
      (e.destination || '').toLowerCase().includes(term) ||
      (e.promoCode || '').toLowerCase().includes(term) ||
      affName.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    if (panelTab === 'website') {
      resetCmsFormFromState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelTab, footerSettings, contactSettings, siteBrandSettings, netaTagsSettings]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Right sliding panel */}
      <div className="w-full h-full bg-slate-950 flex flex-col flex-1">
        
        {/* Header Desk */}
        <div className="bg-slate-900 text-white p-4 md:px-6 md:py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-650 rounded-xl shadow-inner">
              <Database className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-sans font-black tracking-tight flex items-center gap-2">
                <span>ColorMyTrip Admin Desk</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/10 text-slate-300">
                  {isFirebaseActive ? 'Firebase Active' : 'Sandbox (Demo)'}
                </span>
              </h2>
              <p className="text-slate-400 text-xs">
                Manage travel packages, delete outdated blogs, and review user inquiries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell
              notifications={notifications.filter(n => n.userUid === 'admin' || !n.affiliateId)}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={() => markAllNotificationsAsRead('admin')}
            />
            {isAdminLoggedIn ? (
              <button
                onClick={logout}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Log Out Admin"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Back to website"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Security Login Screen when user is not admin */}
        {!isAdminLoggedIn ? (
          <div className="grow flex flex-col justify-center items-center p-8 text-center bg-slate-950">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 shadow-xl">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Administrative Sign In</h3>
            <p className="text-slate-400 mb-8 max-w-sm text-sm font-medium">
              Access is restricted to authorized representatives. Please authenticate with your Google account to manage agency resources.
            </p>
            
            <div className="space-y-4 w-full max-w-xs">
              <button
                onClick={loginWithGoogle}
                className="w-full py-3 bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-lg shadow-indigo-900/40 hover:bg-indigo-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-indigo-500"
              >
                Sign In with Google
              </button>
            </div>
          </div>
        ) : (
          /* Real Administrative Panel controls */
          <div className="grow flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar menu categories */}
            <div className="md:w-60 bg-slate-900 border-r border-slate-800 p-4 space-y-1.5 shrink-0 flex md:flex-col gap-2 md:gap-0 overflow-x-auto md:overflow-x-visible">
              
              <button
                onClick={() => setPanelTab('enquiries')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'enquiries'
                    ? 'bg-indigo-650 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Inbox className="w-5 h-5 shrink-0" />
                <span>Enquiries</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'enquiries' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-350'
                }`}>
                  {enquiries.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('packages')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'packages'
                    ? 'bg-indigo-655 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Globe className="w-5 h-5 shrink-0" />
                <span>Packages Manager</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'packages' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-350'
                }`}>
                  {packages.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('blogs')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'blogs'
                    ? 'bg-indigo-655 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-5 h-5 shrink-0" />
                <span>Blog Articles</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'blogs' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-350'
                }`}>
                  {blogs.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('offers')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'offers'
                    ? 'bg-indigo-655 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Megaphone className="w-5 h-5 shrink-0" />
                <span>Offer Marquee</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'offers' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-350'
                }`}>
                  {offers.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('videos')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'videos'
                    ? 'bg-indigo-655 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Video className="w-5 h-5 shrink-0" />
                <span>Video Testimonials</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'videos' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-350'
                }`}>
                  {videoTestimonials.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('reviews')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'reviews'
                    ? 'bg-indigo-655 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <MessageSquare className="w-5 h-5 shrink-0" />
                <span>Written Reviews</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-350'
                }`}>
                  {reviews.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('promoCodes')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'promoCodes'
                    ? 'bg-indigo-655 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Sparkles className="w-5 h-5 shrink-0" />
                <span>Promo Codes</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'promoCodes' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-350'
                }`}>
                  {promoCodes.length}
                </span>
              </button>

              <button
                onClick={() => setPanelTab('emails')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'emails'
                    ? 'bg-indigo-655 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Mail className="w-5 h-5 shrink-0" />
                <span>Email Desk</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  panelTab === 'emails' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-350'
                }`}>
                  Desk
                </span>
              </button>

              <button
                onClick={() => navigate('/admin/affiliates')}
                className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Globe className="w-5 h-5 shrink-0" />
                <span>Affiliate Management</span>
              </button>

              <button
                onClick={() => setPanelTab('website')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  panelTab === 'website'
                    ? 'bg-indigo-655 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Palette className="w-5 h-5 shrink-0" />
                <span>Website Settings</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-350 rounded-full font-bold`}>
                  CMS
                </span>
              </button>

            </div>

            {/* Display Body Content Panel */}
            <div className="grow overflow-y-auto p-4 md:p-6 bg-slate-950 text-slate-100">
               
              {/* ENQUIRIES TAB LAYOUT */}
              {panelTab === 'enquiries' && (
                <div className="space-y-6">
                  
                  {/* Title, Search & Filters */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
                    <div>
                      <h3 className="text-lg font-black text-white">Enquiries Inbox</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Captures customer enquiries dropping to Info.colormytrip@gmail.com</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                      {/* Enquiries Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search enquiries..."
                          value={enqSearch}
                          onChange={(e) => setEnqSearch(e.target.value)}
                          className="w-full sm:w-60 pl-3 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                        />
                      </div>

                      {/* Filter buttons */}
                      <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                        {['all', 'Enquired', 'Under Processing', 'Under Follow-up', 'Onboarded', 'Completed', 'Cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setEnqFilter(status)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize cursor-pointer transition-colors whitespace-nowrap ${
                              enqFilter === status
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {status === 'all' ? 'All' : status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {filteredEnquiries.length === 0 ? (
                    <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800">
                      <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3 animate-bounce" />
                      <p className="text-slate-400 font-medium text-xs sm:text-sm">No enquiries found matching criteria.</p>
                    </div>
                  ) : (
                    /* Enquiries list table layout */
                    <div className="overflow-x-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
                      <table className="min-w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Package</th>
                            <th className="px-4 py-3 font-mono">Promo Code</th>
                            <th className="px-4 py-3">Affiliate Name</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Estimated Amount</th>
                            <th className="px-4 py-3 text-center">Final Negotiated Amount</th>
                            <th className="px-4 py-3 text-right">Commission</th>
                            <th className="px-4 py-3 text-center">Commission Status</th>
                            <th className="px-4 py-3">Travel Date</th>
                            <th className="px-4 py-3">Created Date</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {filteredEnquiries.map((enq) => {
                            // Find affiliate name from affiliates list
                            const linkedAffiliate = affiliates?.find(a => a.id === enq.affiliateId);
                            const displayAffiliateName = enq.promoCode ? (linkedAffiliate ? linkedAffiliate.fullName : (enq.affiliateName || 'Unknown Affiliate')) : '-';
                            const displayPromoCode = enq.promoCode || '-';
                            
                            // Commission summary display logic (Rule 7)
                            let displayCommission = 'Pending Confirmation';
                            const isOnboardedOrLater = ['Onboarded', 'Completed', 'Cancelled'].includes(enq.bookingStatus || enq.status);
                            
                            if (!enq.affiliateId) {
                              displayCommission = '-';
                            } else if (isOnboardedOrLater) {
                              if (enq.calculatedCommission != null) {
                                displayCommission = `₹${enq.calculatedCommission.toLocaleString()}`;
                              } else {
                                // Fallback calculation if not stored
                                const finalAmt = enq.finalNegotiatedAmount || 0;
                                const val = enq.commissionValue || 0;
                                if (enq.commissionType === 'Percentage') {
                                  displayCommission = `₹${Math.round(finalAmt * (val / 100)).toLocaleString()}`;
                                } else {
                                  displayCommission = `₹${Math.round(val).toLocaleString()}`;
                                }
                              }
                            }

                            return (

                              <tr key={enq.id} className="hover:bg-slate-800/50 transition-colors font-medium border-b border-slate-800">
                                {/* Customer Column */}
                                <td className="px-4 py-3.5">
                                  <div className="font-bold text-white text-xs sm:text-[13px]">{enq.name}</div>
                                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">{enq.email}</div>
                                  <div className="text-indigo-455 font-mono text-[11px]">{enq.phone}</div>
                                </td>

                                {/* Package Column */}
                                <td className="px-4 py-3.5 max-w-[150px] truncate">
                                  <span className="font-bold text-white" title={enq.destination}>
                                    {enq.destination}
                                  </span>
                                </td>

                                {/* Promo Code Column */}
                                <td className="px-4 py-3.5 font-mono font-bold text-slate-350">
                                  {displayPromoCode}
                                </td>

                                {/* Affiliate Name Column */}
                                <td className="px-4 py-3.5 text-white">
                                  {displayAffiliateName}
                                </td>

                                {/* Status Column */}
                                <td className="px-4 py-3.5">
                                  <select
                                    value={enq.bookingStatus || enq.status}
                                    onChange={(e) => handleStatusChange(enq.id, e.target.value as any)}
                                    className="text-[11px] font-bold bg-slate-950 border border-slate-800 rounded-lg p-1 text-white cursor-pointer focus:outline-none focus:border-indigo-500"
                                  >
                                    <option value="Enquired">Enquired</option>
                                    <option value="Under Processing">Under Processing</option>
                                    <option value="Under Follow-up">Under Follow-up</option>
                                    <option value="Onboarded">Onboarded</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>

                                {/* Estimated Amount Column */}
                                <td className="px-4 py-3.5 text-right font-bold text-white">
                                  {enq.estimatedBookingAmount != null ? `₹${enq.estimatedBookingAmount.toLocaleString()}` : (enq.bookingAmount != null ? `₹${enq.bookingAmount.toLocaleString()}` : '-')}
                                </td>

                                {/* Final Negotiated Amount Column */}
                                <td className="px-4 py-3.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      placeholder="-"
                                      value={tempFinalAmounts[enq.id] ?? enq.finalNegotiatedAmount ?? ''}
                                      onChange={(e) => setTempFinalAmounts({ ...tempFinalAmounts, [enq.id]: e.target.value })}
                                      className="w-20 px-2 py-1 text-right text-xs bg-slate-950 border border-slate-800 rounded-lg font-bold text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    {(tempFinalAmounts[enq.id] !== undefined && tempFinalAmounts[enq.id] !== String(enq.finalNegotiatedAmount ?? '')) && (
                                      <button
                                        onClick={() => handleSaveFinalAmount(enq.id, tempFinalAmounts[enq.id])}
                                        className="p-1 bg-emerald-950 text-emerald-450 border border-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors"
                                        title="Save inline negotiated amount"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>

                                {/* Commission Column */}
                                <td className={`px-4 py-3.5 text-right font-bold ${displayCommission === 'Pending Confirmation' ? 'text-slate-500 italic' : 'text-emerald-450'}`}>
                                  {displayCommission}
                                </td>

                                {/* Commission Status Column */}
                                <td className="px-4 py-3.5 text-center">
                                  {enq.affiliateId ? (
                                    <select
                                      value={enq.commissionStatus || 'Pending Confirmation'}
                                      onChange={(e) => handleCommissionStatusChange(enq.id, e.target.value as any)}
                                      disabled={!isOnboardedOrLater}
                                      className="text-[11px] font-bold bg-slate-950 border border-slate-800 rounded-lg p-1 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-indigo-500"
                                    >
                                      <option value="Pending Confirmation">Pending Confirmation</option>
                                      <option value="Generated">Generated</option>
                                      <option value="Processing">Processing</option>
                                      <option value="Processed">Processed</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                  ) : (
                                    <span className="text-slate-500">—</span>
                                  )}
                                </td>

                                {/* Travel Date Column */}
                                <td className="px-4 py-3.5 font-mono text-[11px] text-indigo-400 font-bold">
                                  {enq.travelDate
                                    ? new Date(enq.travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : <span className="text-slate-500">—</span>}
                                </td>

                                {/* Created Date Column */}
                                <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                                  {new Date(enq.createdAt).toLocaleDateString()}
                                </td>

                                {/* Actions Column */}
                                <td className="px-4 py-3.5 text-center">
                                  <button
                                    onClick={async () => {
                                      if (window.confirm('Are you sure you want to permanently delete this enquiry? This action cannot be undone.')) {
                                        try {
                                          await deleteEnquiry(enq.id);
                                          showToast('success', 'Enquiry Deleted', 'The enquiry was permanently deleted.');
                                        } catch (err) {
                                          showToast('error', 'Delete Failed', 'Failed to delete enquiry.');
                                        }
                                      }
                                    }}
                                    className="p-1.5 text-rose-500 hover:bg-rose-950/40 rounded-lg transition-colors"
                                    title="Delete enquiry"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )}

              {/* PACKAGES TAB LAYOUT */}
              {panelTab === 'packages' && (
                <div className="space-y-6">
                       {/* Title & Floating Add */}
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white">Custom Packages Catalog</h3>
                      <p className="text-slate-400 text-xs">Create, view, and delete active travel directories</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          resetPackageForm();
                          setShowPkgAdd(true);
                        }}
                        className="px-4 py-2.5 bg-indigo-650 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 active:scale-[0.99] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Package</span>
                      </button>
                      <button
                        onClick={() => setShowPkgBulkAdd(true)}
                        className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Bulk Upload</span>
                      </button>
                    </div>
                  </div>

                  {/* Package Add / Edit Modal */}
                  {showPkgAdd && (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
                      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-fade-in text-white">
                      <div className="bg-indigo-650 rounded-t-2xl px-6 py-4 flex items-center justify-between border-b border-indigo-700">
                        <div>
                          <h4 className="font-black text-white text-base">{pkgEditingId ? 'Edit Travel Package' : 'New Travel Package'}</h4>
                          <p className="text-indigo-200 text-[11px] mt-0.5">{pkgEditingId ? 'Update existing package listing' : 'Create and publish a new package'}</p>
                        </div>
                        <button
                          onClick={() => { setShowPkgAdd(false); resetPackageForm(); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-700/50 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">

                      <form onSubmit={submitPackage} className="space-y-4">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-350 block mb-1">Package Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Sikkim Old Silk Route Special"
                              value={pTitle}
                              onChange={(e) => setPTitle(e.target.value)}
                              className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-350 block mb-1">Category *</label>
                            <select
                               value={pCat}
                              onChange={(e) => setPCat(e.target.value as any)}
                              className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                            >
                              <option value="domestic">Domestic Tour</option>
                              <option value="international">International Tour</option>
                              <option value="trekking">Trekking</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-350 block mb-1">Starting Price (INR) *</label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 14500"
                              value={pPrice}
                              onChange={(e) => setPPrice(e.target.value)}
                              className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-350 block mb-1">Duration *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 5 Days / 4 Nights"
                              value={pDuration}
                              onChange={(e) => setPDuration(e.target.value)}
                              className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-350 block mb-1">Location *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. East Sikkim, India"
                              value={pLoc}
                              onChange={(e) => setPLoc(e.target.value)}
                              className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                          </div>
                        </div>

                        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-350">
                          <input
                            type="checkbox"
                            checked={pFeatured}
                            onChange={(e) => setPFeatured(e.target.checked)}
                          />
                          Mark as featured package
                        </label>

                        <div>
                          <label className="text-xs font-bold text-slate-350 block mb-1">Cover Image Source URL *</label>
                          <input
                            type="url"
                            required
                            placeholder="https://images.unsplash.com/..."
                            value={pImage}
                            onChange={(e) => setPImage(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-350 block mb-1">Description *</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Enter summary introducing the trail, vibe, and target locations..."
                            value={pDesc}
                            onChange={(e) => setPDesc(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-355 block mb-2">Inclusions (line separated)</label>
                            <textarea
                              rows={3}
                              placeholder="Homestay accommodation&#10;Meals&#10;Shared AC Cab"
                              value={pInclusions}
                              onChange={(e) => setPInclusions(e.target.value)}
                              className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-355 block mb-2">Exclusions (line separated)</label>
                            <textarea
                              rows={3}
                              placeholder="Flights tickets&#10;Tips and porter fee"
                              value={pExclusions}
                              onChange={(e) => setPExclusions(e.target.value)}
                              className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-355 block mb-2">Itinerary (line separated)</label>
                            <textarea
                              rows={3}
                              placeholder="Day 1: Reach Gangtok&#10;Day 2: Stroll Lake&#10;Day 3: Return Drop"
                              value={pItinerary}
                              onChange={(e) => setPItinerary(e.target.value)}
                              className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end border-t border-slate-800 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPkgAdd(false);
                              resetPackageForm();
                            }}
                            className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-650 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                          >
                            {pkgEditingId ? 'Save Changes' : 'Publish Package'}
                          </button>
                        </div>
                      </form>
                      </div>
                    </div>
                  </div>
                  )}

                  {showPkgBulkAdd && (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in text-white">
                      <div className="bg-indigo-650 rounded-t-2xl px-6 py-4 flex items-center justify-between border-b border-indigo-700">
                        <div>
                          <h4 className="font-black text-white text-base">Bulk Package Upload</h4>
                          <p className="text-indigo-200 text-[11px] mt-0.5">Paste a JSON array of package objects</p>
                        </div>
                        <button onClick={() => setShowPkgBulkAdd(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-700/50 hover:bg-indigo-700 text-white transition-colors cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                      <p className="text-xs text-slate-400">Required keys: <code className="text-indigo-400">title, category, price, duration, location, image, description</code></p>
                      <form onSubmit={submitBulkPackages} className="space-y-3">
                        <textarea
                          value={bulkPkgJson}
                          onChange={(e) => setBulkPkgJson(e.target.value)}
                          rows={8}
                          className="w-full border border-slate-800 bg-slate-950 p-3 rounded-lg text-xs font-mono text-white placeholder-slate-500"
                          placeholder='[{"title":"...","category":"domestic","price":12000,"duration":"4 Days / 3 Nights","location":"Sikkim","image":"https://...","description":"...","itinerary":[],"inclusions":[],"exclusions":[],"featured":true}]'
                          required
                        />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setShowPkgBulkAdd(false)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer">
                            Cancel
                          </button>
                          <button type="submit" className="px-5 py-2 bg-indigo-650 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer">
                            Upload Packages
                          </button>
                        </div>
                      </form>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Dynamic packages listing table */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="p-4">Cover / Title</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price / Duration</th>
                          <th className="p-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                        {packages.map((pkg) => (
                          <tr key={pkg.id} className="hover:bg-slate-850/40 border-b border-slate-800 last:border-b-0">
                            <td className="p-4 flex items-center gap-3">
                              <img
                                src={pkg.image}
                                alt={pkg.title}
                                className="w-11 h-11 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h4 className="font-bold text-white line-clamp-1">{pkg.title}</h4>
                                <span className="text-[10px] text-slate-500 font-medium">{pkg.location}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-lg font-bold text-[10px] uppercase bg-slate-950 border border-slate-800 text-slate-300">
                                {pkg.category}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-white">₹{pkg.price.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-slate-500 block font-semibold">{pkg.duration}</span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openPackageEditor(pkg)}
                                  className="p-2 bg-emerald-950/40 text-emerald-450 border border-emerald-900 hover:bg-emerald-900/60 rounded-lg cursor-pointer"
                                  title="Edit listing"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete travel package: "${pkg.title}"?`)) {
                                      deletePackage(pkg.id);
                                    }
                                  }}
                                  className="p-2 bg-indigo-950/40 text-indigo-400 border border-indigo-900 hover:bg-indigo-900/60 rounded-lg cursor-pointer"
                                  title="Delete listing"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* BLOG ARTICLES TAB LAYOUT */}

              {panelTab === 'blogs' && (
                <div className="space-y-6">
                  
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white">Expedition Blog Secretariat</h3>
                      <p className="text-slate-400 text-xs">Delete or publish dynamic content to the blog directory</p>
                    </div>

                    <button
                      onClick={() => {
                        resetBlogForm();
                        setShowBlogAdd(true);
                      }}
                      className="px-4 py-2.5 bg-indigo-650 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Write New Post</span>
                    </button>
                  </div>

                  {/* Blog Add / Edit Modal */}
                  {showBlogAdd && (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
                      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in text-white">
                      
                      <div className="bg-indigo-650 rounded-t-2xl px-6 py-4 flex items-center justify-between border-b border-indigo-700">
                        <div>
                          <h4 className="font-black text-white text-base">{blogEditingId ? 'Edit Blog Article' : 'New Blog Article'}</h4>
                          <p className="text-indigo-200 text-[11px] mt-0.5">{blogEditingId ? 'Update and republish blog post' : 'Write and publish a new expedition article'}</p>
                        </div>
                        <button
                          onClick={() => { setShowBlogAdd(false); resetBlogForm(); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-700/50 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">

                      <form onSubmit={submitBlog} className="space-y-4">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-350 block mb-1">Article Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Winter Trekking Mistakes to Avoid"
                              value={bTitle}
                              onChange={(e) => setBTitle(e.target.value)}
                              className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-350 block mb-1">Author Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Ratnadeep Mukherjee"
                              value={bAuthor}
                              onChange={(e) => setBAuthor(e.target.value)}
                              className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-350 block mb-1">Article Cover Image URL *</label>
                          <input
                            type="url"
                            required
                            placeholder="https://images.unsplash.com/..."
                            value={bImage}
                            onChange={(e) => setBImage(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-350 block mb-1">Short Excerpt *</label>
                          <input
                            type="text"
                            required
                            placeholder="A concise, high-impact paragraph preview..."
                            value={bExcerpt}
                            onChange={(e) => setBExcerpt(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-350 block mb-1">Tags (comma-separated)</label>
                          <input
                            type="text"
                            placeholder="Trekking, Travel Guidance, Kashmir"
                            value={bTags}
                            onChange={(e) => setBTags(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-355 block">Content Body (WordPress-style Rich Text Editor) *</label>
                          
                          {/* Formatting Toolbar */}
                          <div className="flex flex-wrap gap-1 p-1.5 border border-slate-800 rounded-lg bg-slate-950 items-center">
                            <button
                              type="button"
                              onClick={() => executeEditorCommand('bold')}
                              className="px-2.5 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 cursor-pointer shadow-xs"
                              title="Bold"
                            >
                              <b>B</b>
                            </button>
                            <button
                              type="button"
                              onClick={() => executeEditorCommand('italic')}
                              className="px-2.5 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 cursor-pointer shadow-xs"
                              title="Italic"
                            >
                              <i>I</i>
                            </button>
                            <button
                              type="button"
                              onClick={() => executeEditorCommand('underline')}
                              className="px-2.5 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 cursor-pointer shadow-xs"
                              title="Underline"
                            >
                              <u>U</u>
                            </button>

                            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                            <button
                              type="button"
                              onClick={() => executeEditorCommand('formatBlock', '<h2>')}
                              className="px-2.5 py-1 text-[11px] font-black bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-indigo-400 cursor-pointer shadow-xs"
                              title="Heading 2"
                            >
                              H2
                            </button>
                            <button
                              type="button"
                              onClick={() => executeEditorCommand('formatBlock', '<h3>')}
                              className="px-2.5 py-1 text-[11px] font-black bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-indigo-400 cursor-pointer shadow-xs"
                              title="Heading 3"
                            >
                              H3
                            </button>
                            <button
                              type="button"
                              onClick={() => executeEditorCommand('formatBlock', '<p>')}
                              className="px-2.5 py-1 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 cursor-pointer shadow-xs"
                              title="Paragraph"
                            >
                              P
                            </button>

                            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                            <button
                              type="button"
                              onClick={() => executeEditorCommand('insertUnorderedList')}
                              className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 cursor-pointer shadow-xs"
                              title="Bullet List"
                            >
                              • List
                            </button>
                            <button
                              type="button"
                              onClick={() => executeEditorCommand('insertOrderedList')}
                              className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 cursor-pointer shadow-xs"
                              title="Numbered List"
                            >
                              1. List
                            </button>

                            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                            <button
                              type="button"
                              onClick={addEditorLink}
                              className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-350 cursor-pointer shadow-xs flex items-center justify-center"
                              title="Insert Link"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={addEditorImage}
                              className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-350 cursor-pointer shadow-xs flex items-center justify-center"
                              title="Insert Image inline"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => executeEditorCommand('removeFormat')}
                              className="px-2 py-1 text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded text-slate-400 cursor-pointer"
                              title="Clear styles"
                            >
                              Clear
                            </button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Rich Editor Editable Field */}
                            <div className="relative">
                              <div
                                ref={blogEditorRef}
                                contentEditable
                                onInput={handleEditorInput}
                                className="w-full min-h-[340px] max-h-[500px] border border-slate-800 bg-slate-950 p-3.5 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 overflow-y-auto leading-relaxed space-y-2 block"
                              />
                            </div>

                            {/* Custom Styled Preview Panel */}
                            <div className="border border-slate-850 rounded-lg p-3.5 bg-slate-950/40 max-h-[500px] overflow-y-auto">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Live Document Preview</p>
                              <div 
                                className="prose prose-indigo max-w-none text-xs text-slate-300 leading-relaxed space-y-3 font-normal blog-content-html" 
                                dangerouslySetInnerHTML={{ __html: blogPreviewHtml }} 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end border-t border-slate-800 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowBlogAdd(false);
                              resetBlogForm();
                            }}
                            className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-650 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                          >
                            {blogEditingId ? 'Save Blog Changes' : 'Publish Blog'}
                          </button>
                        </div>
                      </form>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Blog articles list rows */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    {blogs.map((post) => (
                      <div key={post.id} className="p-4 flex items-center justify-between gap-4 border-b border-slate-800/60 last:border-b-0 text-slate-300 hover:bg-slate-850/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-bold text-white text-xs sm:text-sm">{post.title}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">{post.author} • {new Date(post.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openBlogEditor(post)}
                            className="p-2 bg-emerald-950/40 text-emerald-450 border border-emerald-900 hover:bg-emerald-900/60 rounded-lg cursor-pointer"
                            title="Edit post"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete blog post: "${post.title}"?`)) {
                                deleteBlog(post.id);
                              }
                            }}
                            className="p-2 bg-indigo-950/40 text-indigo-400 border border-indigo-900 hover:bg-indigo-900/60 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}


              {/* OFFERS MARQUEE TAB LAYOUT */}
              {panelTab === 'offers' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white">Homepage Offer Marquee</h3>
                      <p className="text-slate-400 text-xs">Control running offer text, speed, and colors for the hero ticker.</p>
                    </div>
                    <button
                      onClick={() => {
                        resetOfferForm();
                        setShowOfferAdd(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-650 text-white text-xs font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Offer</span>
                    </button>
                  </div>

                  {showOfferAdd && (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in text-white">
                      <div className="bg-indigo-650 rounded-t-2xl px-6 py-4 flex items-center justify-between border-b border-indigo-700">
                        <div>
                          <h4 className="font-black text-white text-base">{offerEditingId ? 'Edit Offer Banner' : 'New Offer Banner'}</h4>
                          <p className="text-indigo-200 text-[11px] mt-0.5">Marquee offer displayed across the site</p>
                        </div>
                        <button onClick={() => { setShowOfferAdd(false); resetOfferForm(); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-700/50 hover:bg-indigo-700 text-white transition-colors cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-6">

                      <form onSubmit={submitOffer} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-350 block mb-1">Offer Text</label>
                          <input
                            type="text"
                            value={offerText}
                            onChange={(e) => setOfferText(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500"
                            placeholder="🔥 Meghalaya Group Tour Starting @ ₹8,999"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-355 mb-1 flex items-center gap-1"><Timer className="w-3 h-3" />Speed (seconds)</label>
                            <input type="number" min={10} max={80} value={offerSpeed} onChange={(e) => setOfferSpeed(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-355 mb-1 flex items-center gap-1"><Palette className="w-3 h-3" />Background</label>
                            <input type="color" value={offerBackground} onChange={(e) => setOfferBackground(e.target.value)} className="w-full h-9 border border-slate-800 bg-slate-950 p-1 rounded-lg cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-355 block mb-1">Text Color</label>
                            <input type="color" value={offerTextColor} onChange={(e) => setOfferTextColor(e.target.value)} className="w-full h-9 border border-slate-800 bg-slate-950 p-1 rounded-lg cursor-pointer" />
                          </div>
                        </div>
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-350">
                          <input type="checkbox" checked={offerActive} onChange={(e) => setOfferActive(e.target.checked)} />
                          Active on homepage
                        </label>
                        <div className="flex justify-end gap-2 pt-1 border-t border-slate-800 mt-2">
                          <button type="button" onClick={() => { setShowOfferAdd(false); resetOfferForm(); }} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-indigo-650 text-white rounded-lg text-xs font-bold cursor-pointer">{offerEditingId ? 'Save Offer' : 'Add Offer'}</button>
                        </div>
                      </form>
                      </div>
                    </div>
                  </div>
                  )}

                  <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                    {offers.length === 0 ? (
                      <div className="p-10 text-center text-xs text-slate-550">No marquee offers configured.</div>
                    ) : (
                      offers.map((offer) => (
                        <div key={offer.id} className="p-4 border-b border-slate-800 last:border-b-0 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-slate-300 hover:bg-slate-850/40 transition-colors">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-white">{offer.offer_text}</p>
                            <p className="text-[11px] text-slate-500">Speed: {offer.speed}s • {offer.is_active ? 'Active' : 'Paused'}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-550">
                              <span className="inline-flex items-center gap-1">BG <span className="w-4 h-4 rounded border border-slate-800 inline-block" style={{ backgroundColor: offer.background_color }} /></span>
                              <span className="inline-flex items-center gap-1">Text <span className="w-4 h-4 rounded border border-slate-800 inline-block" style={{ backgroundColor: offer.text_color }} /></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openOfferEditor(offer)} className="p-2 bg-emerald-950/40 text-emerald-450 border border-emerald-900 hover:bg-emerald-900/60 rounded-lg cursor-pointer"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => updateOffer(offer.id, { is_active: !offer.is_active })} className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-slate-800 bg-slate-950 hover:text-white transition-colors cursor-pointer">
                              {offer.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deleteOffer(offer.id)} className="p-2 bg-indigo-950/40 text-indigo-400 border border-indigo-900 hover:bg-indigo-900/60 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
                             {/* PROMO CODES TAB LAYOUT */}

              {panelTab === 'promoCodes' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white">Promo Code Manager</h3>
                      <p className="text-slate-400 text-xs">Create, edit, and assign promo codes to affiliates.</p>
                    </div>
                    <button
                      onClick={() => {
                        resetPromoForm();
                        setPanelTab('promoCodes');
                      }}
                      className="px-4 py-2.5 bg-indigo-650 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Promo Code</span>
                    </button>
                  </div>

                  <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-5 text-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div>
                        <h4 className="font-black text-white text-sm">{promoId ? 'Edit Promo Code' : 'Create New Promo Code'}</h4>
                        <p className="text-slate-400 text-xs">Any promo code added here is validated during enquiry submission.</p>
                      </div>
                      {promoId && (
                        <button
                          type="button"
                          onClick={resetPromoForm}
                          className="text-indigo-400 text-xs font-bold hover:text-indigo-300 cursor-pointer"
                        >
                          Clear editor
                        </button>
                      )}
                    </div>

                    <form onSubmit={handlePromoSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-350 block">Promo Code *</label>
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="EXAMPLE10"
                          className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-355 block">Label</label>
                        <input
                          type="text"
                          value={promoLabel}
                          onChange={(e) => setPromoLabel(e.target.value)}
                          placeholder="Summer launch promo"
                          className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                        />
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <label className="text-xs font-bold text-slate-355 block">Description</label>
                        <textarea
                          rows={2}
                          value={promoDescription}
                          onChange={(e) => setPromoDescription(e.target.value)}
                          placeholder="Optional note to identify the promo in reports"
                          className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-355 block">Affiliate</label>
                        <select
                          value={promoAffiliateId}
                          onChange={(e) => setPromoAffiliateId(e.target.value)}
                          className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">General promo (no affiliate)</option>
                          {affiliates.map((affiliate) => (
                            <option key={affiliate.id} value={affiliate.id} className="bg-slate-950 text-white">
                              {affiliate.fullName} — {affiliate.email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-355 block">Status</label>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 text-xs text-slate-350 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={promoActive}
                              onChange={(e) => setPromoActive(e.target.checked)}
                              className="rounded border-slate-800 text-indigo-650 focus:ring-indigo-550"
                            />
                            Active
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-355 block">Expiry Date</label>
                        <input
                          type="date"
                          value={promoExpiryDate}
                          onChange={(e) => setPromoExpiryDate(e.target.value)}
                          className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-355 block">Usage Limit</label>
                        <input
                          type="number"
                          min="0"
                          value={promoUsageLimit}
                          onChange={(e) => setPromoUsageLimit(e.target.value)}
                          placeholder="e.g. 50"
                          className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-355 block">Commission Type</label>
                        <select
                          value={promoCommissionType}
                          onChange={(e) => setPromoCommissionType(e.target.value as any)}
                          className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Percentage">Percentage</option>
                          <option value="Fixed Amount">Fixed Amount</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-355 block">Commission Value</label>
                        <input
                          type="number"
                          min="0"
                          value={promoCommissionValue}
                          onChange={(e) => setPromoCommissionValue(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-3 pt-2">
                        <label className="text-xs font-bold text-slate-355 block">Applicable Packages (Leave empty for all)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-slate-800 bg-slate-950 rounded-lg p-3">
                          {packages.map(pkg => (
                            <label key={pkg.id} className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={promoApplicablePackages.includes(pkg.id!)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPromoApplicablePackages([...promoApplicablePackages, pkg.id!]);
                                  } else {
                                    setPromoApplicablePackages(promoApplicablePackages.filter(id => id !== pkg.id));
                                  }
                                }}
                                className="rounded border-slate-800 text-indigo-650 focus:ring-indigo-550"
                              />
                              <span className="truncate text-slate-300" title={pkg.title}>{pkg.title}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 justify-end border-t border-slate-800 pt-3">
                        <button
                          type="button"
                          onClick={resetPromoForm}
                          className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Reset Form
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-indigo-650 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                        >
                          {promoId ? 'Save Promo Code' : 'Create Promo Code'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden text-slate-300">
                    <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/50">
                      <div>
                        <h4 className="font-black text-white text-sm">Existing Promo Codes</h4>
                        <p className="text-slate-400 text-xs">Tap a row to edit a promo code, or delete to remove it.</p>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Search codes..."
                          value={promoSearch}
                          onChange={(e) => setPromoSearch(e.target.value)}
                          className="w-full sm:w-48 px-3 py-1.5 text-xs border border-slate-800 bg-slate-950 text-white rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                        />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 whitespace-nowrap">{promoCodes.length} promo{promoCodes.length === 1 ? '' : 's'}</span>
                      </div>
                    </div>

                    {promoCodes.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">No promo codes configured yet.</div>
                    ) : (
                      <div className="divide-y divide-slate-800">
                        {promoCodes.filter(p => !p.deleted && (p.code.toLowerCase().includes(promoSearch.toLowerCase()) || (p.label && p.label.toLowerCase().includes(promoSearch.toLowerCase())))).map((promo) => (
                          <div key={promo.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between hover:bg-slate-850/40 transition-colors">
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm">{promo.code}</p>
                              <p className="text-[11px] text-slate-400 mt-1 leading-5">
                                {promo.label || promo.description || 'No label provided'}
                              </p>
                              <div className="mt-2 text-[10px] text-slate-500 flex flex-wrap gap-2.5 font-mono">
                                <span className={`px-1.5 py-0.5 rounded ${promo.active !== false ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40' : 'bg-slate-950 text-slate-500 border border-slate-850'}`}>
                                  {promo.active !== false ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                                {promo.affiliateId ? <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">AFFILIATE: {promo.affiliateId}</span> : <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">GENERAL</span>}
                                {promo.expiryDate ? <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">EXP: {String(promo.expiryDate).slice(0, 10)}</span> : null}
                                {promo.usageLimit != null ? <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">LIMIT: {promo.usageLimit}</span> : null}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => editPromo(promo)}
                                className="px-3 py-1.5 bg-emerald-950/40 text-emerald-450 border border-emerald-900 rounded-lg text-[10px] font-bold hover:bg-emerald-900/60 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete promo code ${promo.code}?`)) {
                                    deletePromoCode(promo.id);
                                  }
                                }}
                                className="px-3 py-1.5 bg-indigo-950/40 text-indigo-400 border border-indigo-900 rounded-lg text-[10px] font-bold hover:bg-indigo-900/60 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}


              {panelTab === 'website' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white">Website Content & Contact CMS</h3>
                      <p className="text-slate-405 text-xs">Update footer, contact details, brand assets, social links, and neta tags.</p>
                    </div>
                    <button
                      onClick={resetCmsFormFromState}
                      className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:text-white cursor-pointer"
                    >
                      Load Saved Values
                    </button>
                  </div>

                  <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl text-white">
                    <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                      <h4 className="text-sm font-black text-white">Footer Settings</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-350 block mb-1">Footer Description</label>
                          <textarea
                            rows={3}
                            value={footerDescriptionText}
                            onChange={(e) => setFooterDescriptionText(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            placeholder="Short footer paragraph"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Copyright Text</label>
                          <input
                            type="text"
                            value={footerCopyrightText}
                            onChange={(e) => setFooterCopyrightText(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            placeholder="© 2026 ..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-355 block mb-1">Headquarters Address (rendered in footer + contact)</label>
                        <textarea
                          rows={3}
                          value={footerHeadquartersAddress}
                          onChange={(e) => setFooterHeadquartersAddress(e.target.value)}
                          className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                          placeholder="Sevoke Road, near PC Mittal Bus Stand, ..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={footerPhoneNumber}
                            onChange={(e) => setFooterPhoneNumber(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            placeholder="+91 ..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Email Address</label>
                          <input
                            type="email"
                            value={footerEmailAddress}
                            onChange={(e) => setFooterEmailAddress(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            placeholder="info@..."
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-white">Social Links (optional)</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Only URLs you provide will be linked from the footer icons.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Facebook URL</label>
                          <input type="url" value={socialFacebookUrl} onChange={(e) => setSocialFacebookUrl(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500" placeholder="https://facebook.com/..." />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Instagram URL</label>
                          <input type="url" value={socialInstagramUrl} onChange={(e) => setSocialInstagramUrl(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500" placeholder="https://instagram.com/..." />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Twitter URL</label>
                          <input type="url" value={socialTwitterUrl} onChange={(e) => setSocialTwitterUrl(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500" placeholder="https://twitter.com/..." />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">YouTube URL</label>
                          <input type="url" value={socialYoutubeUrl} onChange={(e) => setSocialYoutubeUrl(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500" placeholder="https://youtube.com/..." />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={async () => {
                            try {
                              await updateFooterSettings({
                                headquarters_address: footerHeadquartersAddress,
                                phone_number: footerPhoneNumber,
                                email_address: footerEmailAddress,
                                footer_description_text: footerDescriptionText,
                                copyright_text: footerCopyrightText,
                                social_links: {
                                  facebook_url: socialFacebookUrl || undefined,
                                  instagram_url: socialInstagramUrl || undefined,
                                  twitter_url: socialTwitterUrl || undefined,
                                  youtube_url: socialYoutubeUrl || undefined,
                                },
                              } as any);
                              showToast('success', 'Footer Saved', 'Footer settings saved successfully.');
                            } catch (e) {
                              console.error(e);
                              showToast('error', 'Save Failed', 'Failed to save footer settings.');
                            }
                          }}
                          className="px-5 py-2 bg-indigo-650 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                        >
                          Save Footer Settings
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl text-white">
                    <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                      <h4 className="text-sm font-black text-white">Contact Page Settings</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-350 block mb-1">Contact Email (overrides footer email)</label>
                          <input type="email" value={contactEmailAddress} onChange={(e) => setContactEmailAddress(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500" placeholder="info@..." />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Contact Phone (overrides footer phone)</label>
                          <input type="text" value={contactPhoneNumber} onChange={(e) => setContactPhoneNumber(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500" placeholder="+91 ..." />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={async () => {
                            try {
                              await updateContactSettings({
                                email_address: contactEmailAddress,
                                phone_number: contactPhoneNumber,
                              } as any);
                              showToast('success', 'Contact Saved', 'Contact settings saved successfully.');
                            } catch (e) {
                              console.error(e);
                              showToast('error', 'Save Failed', 'Failed to save contact settings.');
                            }
                          }}
                          className="px-5 py-2 bg-indigo-650 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                        >
                          Save Contact Settings
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl text-white">
                    <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                      <h4 className="text-sm font-black text-white">Brand Assets + Neta Tags</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Site Logo URL (fallback for footer logo)</label>
                          <input type="url" value={siteLogoUrl} onChange={(e) => setSiteLogoUrl(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500" placeholder="https://.../logo-white.png" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Footer Logo URL</label>
                          <input type="url" value={footerLogoUrl} onChange={(e) => setFooterLogoUrl(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500" placeholder="https://.../logo-white.png" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Favicon URL</label>
                          <input type="url" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500" placeholder="https://.../favicon.ico" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-355 block mb-1">Neta Tags (comma separated)</label>
                          <input type="text" value={netaTagsText} onChange={(e) => setNetaTagsText(e.target.value)} className="w-full border border-slate-800 bg-slate-950 p-2 rounded-lg text-xs text-white placeholder-slate-500" placeholder="neta1, neta2, neta3" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={async () => {
                            try {
                              const tagsArr = netaTagsText.split(',').map(s => s.trim()).filter(Boolean);
                              await updateSiteBrandSettings({
                                site_logo_url: siteLogoUrl || undefined,
                                footer_logo_url: footerLogoUrl || undefined,
                                favicon_url: faviconUrl || undefined,
                              } as any);
                              await updateNetaTagsSettings({
                                neta_tags: tagsArr,
                                neta_tags_text: netaTagsText,
                              } as any);
                              showToast('success', 'Brand Settings Saved', 'Brand and SEO neta tags saved successfully.');
                            } catch (e) {
                              console.error(e);
                              showToast('error', 'Save Failed', 'Failed to save brand/neta settings.');
                            }
                          }}
                          className="px-5 py-2 bg-indigo-650 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                        >
                          Save Brand & Neta Tags
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {panelTab === 'videos' && (
                <div className="space-y-6">
                  
                  {/* Title & Add Video Button */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white">Video Testimonials</h3>
                      <p className="text-slate-400 text-xs">Manage customer video testimonials (reels format)</p>
                    </div>

                    <button
                      onClick={() => setShowVideoAdd(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-655 text-white text-xs font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Video Testimonial</span>
                    </button>
                  </div>

                  {/* Video Upload Modal */}
                  {showVideoAdd && (
                    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-white animate-fade-in">
                        <div className="bg-indigo-650 text-white p-5 flex items-center justify-between border-b border-indigo-700">
                          <h4 className="font-black text-lg">Upload Video Testimonial</h4>
                          <button onClick={() => setShowVideoAdd(false)} className="hover:bg-indigo-700 p-1 rounded cursor-pointer">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          if (!vName || !vTitle || !vLocation || !vVideoUrl || !vDuration) {
                            showToast('warning', 'Validation Error', 'Please fill in all testimonial fields.');
                            return;
                          }
                          try {
                            await addVideoTestimonial({
                              name: vName,
                              title: vTitle,
                              location: vLocation,
                              videoUrl: vVideoUrl,
                              duration: Number(vDuration)
                            });
                            showToast('success', 'Video Added', `Video testimonial from "${vName}" added successfully.`);
                            setVName('');
                            setVTitle('');
                            setVLocation('');
                            setVVideoUrl('');
                            setVDuration('');
                            setShowVideoAdd(false);
                          } catch (err) {
                            showToast('error', 'Upload Failed', 'Failed to add video testimonial.');
                          }
                        }} className="p-6 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-350 mb-1.5">Customer Name *</label>
                            <input
                              type="text"
                              value={vName}
                              onChange={(e) => setVName(e.target.value)}
                              placeholder="E.g., Priya & Family"
                              className="w-full px-3 py-2 border border-slate-800 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-350 mb-1.5">Video Title *</label>
                            <input
                              type="text"
                              value={vTitle}
                              onChange={(e) => setVTitle(e.target.value)}
                              placeholder="E.g., Sikkim Adventure"
                              className="w-full px-3 py-2 border border-slate-800 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-355 mb-1.5">Location *</label>
                            <input
                              type="text"
                              value={vLocation}
                              onChange={(e) => setVLocation(e.target.value)}
                              placeholder="E.g., Zuluk, Sikkim"
                              className="w-full px-3 py-2 border border-slate-800 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-355 mb-1.5">YouTube Embed URL *</label>
                            <input
                              type="text"
                              value={vVideoUrl}
                              onChange={(e) => setVVideoUrl(e.target.value)}
                              placeholder="https://www.youtube.com/embed/VIDEO_ID"
                              className="w-full px-3 py-2 border border-slate-800 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Use YouTube embed format (not regular URL)</p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-355 mb-1.5">Duration (seconds) *</label>
                            <input
                              type="number"
                              value={vDuration}
                              onChange={(e) => setVDuration(e.target.value)}
                              placeholder="E.g., 45"
                              className="w-full px-3 py-2 border border-slate-800 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                            />
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => setShowVideoAdd(false)}
                              className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 px-4 py-2 bg-indigo-650 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                            >
                              Upload Testimonial
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Video testimonials list */}
                  {videoTestimonials.length === 0 ? (
                    <div className="p-12 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                      <Video className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium text-xs sm:text-sm">No video testimonials yet. Add your first one!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videoTestimonials.map((video) => (
                        <div key={video.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl text-slate-300 hover:bg-slate-850/40 transition-colors">
                          <div className="flex gap-3 items-start">
                            <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0">
                              <Video className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-white text-sm">{video.name}</p>
                              <p className="text-indigo-400 text-xs font-semibold">{video.title}</p>
                              <p className="text-slate-500 text-xs mt-1">{video.location} • {video.duration}s</p>
                            </div>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Permanently delete video testimonial from "${video.name}"?`)) {
                                  try {
                                    await deleteVideoTestimonial(video.id);
                                    showToast('success', 'Video Deleted', `Testimonial from "${video.name}" permanently deleted.`);
                                  } catch (err) {
                                    showToast('error', 'Delete Failed', 'Failed to delete video testimonial.');
                                  }
                                }
                              }}
                              className="p-2 bg-indigo-950/40 text-indigo-400 border border-indigo-900 hover:bg-indigo-900/60 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {panelTab === 'reviews' && (
                <ReviewsPanel
                  reviews={reviews}
                  addReview={addReview}
                  deleteReview={deleteReview}
                  showToast={showToast}
                />
              )}

              {panelTab === 'emails' && (
                <EmailsPanel
                  enquiries={enquiries}
                  customTemplates={customTemplates}
                  scheduledEmails={scheduledEmails}
                  saveCustomTemplate={saveCustomTemplate}
                  deleteCustomTemplate={deleteCustomTemplate}
                  scheduleEmail={scheduleEmail}
                  deleteScheduledEmail={deleteScheduledEmail}
                  updateScheduledEmailStatus={updateScheduledEmailStatus}
                  showToast={showToast}
                  packages={packages}
                />
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
