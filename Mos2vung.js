/* ============================================================
   mos2vung.js  —  NHÓM CÁC POPUP MOS WORD
   ============================================================
   NGUYÊN TẮC:
   - Tất cả <select> mặc định "-- Chọn --"
   - Tất cả <input number> để trống
   - popupAnswer dùng true/false cho lựa chọn, số cho giá trị
   - Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo

   DANH SÁCH popupType:
     'create-table'       cols, rows
     'columns-popup'      numCols1/2/3, applyWhole/Forward
     'tab-popup'          tabStop, alignLeft/.../Bar, leaderNone/.../Underline
     'page-setup'         top, bottom, left, right
     'indent-popup'       left, right, before, after
     'paragraph-spacing'  alignXxx, outlineXxx, specialXxx, lsXxx, số
     'font-size'          fontArial/.../Verdana, size, bold, italic, underline
     'spelling-grammar'   checkSpelling, markGrammar, ... (true/false)
     'ten-popup-moi'      truong1
'show-doc-content'  
case 'find-replace'

============================================================ */

/* ============================================================
   CSS POPUP
============================================================ */
(function injectPopupCSS(){
    const style = document.createElement('style');
    style.textContent = `
.mos-popup-overlay{
    position:absolute;left:0;top:0;width:100%;height:100%;
    background:rgba(0,0,0,0.45);z-index:100;
    display:flex;justify-content:center;align-items:center;
}
.mos-popup-box{
    background:#f0f4f8;border:2px solid #94a3b8;border-radius:6px;
    min-width:280px;max-width:90%;
    box-shadow:4px 4px 12px rgba(0,0,0,0.4);
    font-family:Arial,sans-serif;font-size:12px;overflow:visible;
}
.mos-popup-header{
    background:#2563eb;color:#fff;
    padding:6px 12px;font-size:13px;font-weight:bold;
    display:flex;justify-content:space-between;align-items:center;
}
.mos-popup-header .pp-close{
    cursor:pointer;font-size:16px;line-height:1;
    background:none;border:none;color:#fff;padding:0 4px;
}
.mos-popup-header .pp-close:hover{background:#dc2626;border-radius:3px;}
.mos-popup-body{padding:14px 16px;display:flex;flex-direction:column;gap:12px;}
.mos-popup-body label{font-size:12px;color:#374151;margin-bottom:2px;display:block;}
.mos-popup-body input[type="number"],
.mos-popup-body input[type="text"],
.mos-popup-body select{
    width:100%;padding:5px 8px;border:1px solid #94a3b8;
    border-radius:4px;font-size:13px;box-sizing:border-box;background:#fff;
}
.mos-popup-body input[type="number"]{width:90px;}
.pp-group-title{
    font-size:12px;font-weight:bold;color:#1e3a5f;
    border-bottom:1px solid #cbd5e1;padding-bottom:3px;margin-top:6px;
}
.pp-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.pp-grid-item{display:flex;flex-direction:column;}
.pp-radio-group,.pp-check-group{display:flex;flex-direction:column;gap:1px;}
.pp-radio-group label,.pp-check-group label{
    display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;
}
.pp-radio-group input[type="radio"],
.pp-check-group input[type="checkbox"]{width:auto;cursor:pointer;}
.pp-table{width:100%;border-collapse:collapse;font-size:12px;}
.pp-table th{background:#e2e8f0;padding:4px 8px;text-align:left;border:1px solid #cbd5e1;}
.pp-table td{padding:4px 8px;border:1px solid #cbd5e1;}
.pp-table td input[type="number"]{width:70px;}
.pp-btn-row{
    display:flex;gap:8px;justify-content:flex-end;
    margin-top:1px;padding-top:1px;border-top:1px solid #e2e8f0;
}
.pp-btn{
    padding:5px 18px;border:1px solid #94a3b8;border-radius:4px;
    font-size:13px;font-weight:bold;cursor:pointer;
    background:#f8fafc;color:#1e3a5f;
}
.pp-btn:hover{background:#e2e8f0;}
.pp-btn.pp-btn-ok{background:#2563eb;color:#fff;border-color:#1d4ed8;}
.pp-btn.pp-btn-ok:hover{background:#1d4ed8;}
.pp-btn.pp-btn-cancel{background:#f1f5f9;}
.pp-error{
    color:#dc2626;font-size:12px;font-weight:bold;
    background:#fef2f2;padding:5px 8px;border-radius:4px;
    border:1px solid #fca5a5;display:none;
}
.pp-disabled{background:#f1f5f9!important;color:#94a3b8!important;cursor:not-allowed;}
`;
    document.head.appendChild(style);
})();

/* ============================================================
   HÀM TIỆN ÍCH CHUNG
============================================================ */
function _createPopupShell(title){
    const sim = document.getElementById('simulator0');
    const old = sim.querySelector('.mos-popup-overlay');
    if(old){ old.remove(); }
    const overlay = document.createElement('div');
    overlay.className = 'mos-popup-overlay';
    const box = document.createElement('div');
    box.className = 'mos-popup-box';
    const header = document.createElement('div');
    header.className = 'mos-popup-header';
    header.innerHTML = '<span>'+title+'</span>'
        +'<button class="pp-close" onclick="closeMosPopup()">✕</button>';
    box.appendChild(header);
    overlay.appendChild(box);
    sim.appendChild(overlay);
    return box;
}
function closeMosPopup(){
    const sim = document.getElementById('simulator0');
    const ov  = sim.querySelector('.mos-popup-overlay');
    if(ov){ ov.remove(); }
}
function _showPopupError(id,msg){
    const el=document.getElementById(id);
    if(el){el.textContent=msg;el.style.display='block';}
}
function _hidePopupError(id){
    const el=document.getElementById(id);
    if(el){el.style.display='none';}
}

/* ============================================================
   HÀM DISPATCH TRUNG TÂM (xem tên popuptype: 'find-replace',)
============================================================ */
function openMosPopup(step){
    if(!step||!step.popupType){return;}
    switch(step.popupType){
/* 01 */	case 'create-table':      openCreateTablePopup(step);      break;
/* 02 */	case 'columns-popup':     openColumnsPopup(step);          break;
/* 03 */	case 'tab-popup':         openTabPopup(step);              break;
/* 04 */	case 'page-setup':        openPageSetupPopup(step);        break;
/* 05 */	case 'indent-popup':      openIndentPopup(step);           break;
/* 06 */	case 'paragraph-spacing': openParagraphSpacingPopup(step); break;
/* 07 */	case 'font-size':         openFontSizePopup(step);         break;
/* 08 */	case 'spelling-grammar':  openSpellingGrammarPopup(step);  break;
/* 09 */	case 'ribbon-only': openRibbonOnlyPopup(step); break;

/* 11 */	case 'find-replace':      openFindReplacePopup(step);      break;
/* 12 */	case 'word-display':      openWordDisplayPopup(step);      break;

/* 14 */	case 'hyperlink': openHyperlinkPopup(step); break;
/* 15 */	case 'set-numbering': openSetNumberingPopup(step); break;
/* 16 SX thứ tự văn bản */	case 'smartart-text': openSmartArtPopup(step); break;
/* 17 */	case 'caption': openCaptionPopup(step); break;
/* 18 */	case 'doc-inspect': openDocInspectPopup(step); break;
/* 19 */	case 'bookmark':  openBookmarkPopup(step);  break;
/* 20 */	case 'watermark': openWatermarkPopup(step); break;
/* 21 */	case 'zoom':     openZoomPopup(step);    break;
/* 22 */	case 'alt-text': openAltTextPopup(step); break;
/* 23 */	case 'goto': openGotoPopup(step); break;
/* 24 */	case 'drop-cap':       openDropCapPopup(step);         break;
/* 25 */	case 'manage-sources': openManageSourcesPopup(step);   break;
/* 26 */	case 'find-nav':  openFindNavPopup(step);    break;

/* 28 */	case 'insert-tof': openInsertTofPopup(step); break;
/* 29 */	case 'update-table': openUpdateTablePopup(step); break;
/* 30 */	case 'sort':           openSortPopup(step);          break;
/* 31 */	case 'borders-shading': openBordersShadingPopup(step); break;

/* 33 */	case 'autocorrect':     openAutoCorrectPopup(step);    break;
/* 34 */	case 'coverpage':       openCoverPagePopup(step);      break;
/* 35 */	case 'option-advanced': openOptionAdvancedPopup(step); break;
/* 36 */	case 'symbol-special': openSymbolSpecialPopup(step); break;
/* 37 */	case 'print': openPrintPopup(step); break;
/* 38 */	case 'footnote-endnote': openFootnoteEndnotePopup(step); break;
/* 39 hộp thoại Font */	case 'more-font': openMoreFontPopup(step); break;
/* 40 */	case 'protect-document': openProtectDocumentPopup(step); break;
/* 41 */	case 'create-style': openCreateStylePopup(step); break;
/* 42(tài liệu+hinhanh)*/	case 'insert-object': openInsertObjectPopup(step); break;
/* 43 */	case 'insert-chart': openInsertChartPopup(step); break;
/* 44 */	case 'insert-index': openInsertIndexPopup(step); break;
/* 45 */	case 'track-changes-review': openTrackChangesReviewPopup(step); break;
/* 46 */	case 'mail-merge': openMailMergePopup(step); break;
/* 47 */	case 'insert-equation': openInsertEquationPopup(step); break;
/* 48 Thuộc tính tài liệu*/	case 'doc-properties-summary': openDocPropertiesSummaryPopup(step); break;
/* 49 đường dẫn lưu,nâng bao gồm 42 */	case 'file-open': openFileOpenPopup(step); break;
/* 50 */	case 'file-saveas': openFileSaveAsPopup(step); break;
/* 51 click phải Shape thêm VB*/	case 'shape-add-text': openShapeAddTextPopup(step); break;
/* 52 */	case 'save-options': openSaveOptionsPopup(step); break;
/* 53 Click phải ra menu chọn 1, ra menu + nội dung*/	case 'object-context-menu': openObjectContextMenuPopup(step); break;
/* 54 Chọn kiểu xoay và nhập Text */	case 'text-direction': openTextDirectionPopup(step); break;

/* 56 Chọn nhiều tọa độ, đáp án 1*/ 	case 'picture-click': openFontColorT9Popup(step); break;
/* 57 */ 				case 'remove-background': openRemoveBackgroundPopup(step); break;
/* 58 Chọn nhiều tọa độ, nhiều đáp án*/ 	case 'multi-hotspot': openMultiHotspotPopup(step); break;
/* 59 Chọn nhiều tọa độ hiện menu*/ 	case 'multi-hotspot-dropdown': openMultiHotspotDropdownPopup(step); break;
/* 60 vẽ shape và nhập VB*/ 		case 'veshape': openVeShapePopup(step); break;
/* 61 Chọn đoạn văn bản (Click/3click/Drag)*/	case 'text-selection': openTextSelectionPopup(step); break;
/* 62 Chọn Bảng / Chọn Dòng trong Bảng */	case 'table-row-selection':    openTableSelectionPopup_62(step);    break;
/* 63 Thao tác Section Break / Page Break và phím Delete */	case 'section-break':    openSectionBreakPopup(step);    break;
/* 64 Chọn đoạn văn bản (Text Selection) */case 'text-selection-64':    openPageSelect64(step);    break;
/*nâng cấp từ 61: dùng renderer vùng 2 của Popup 64 */	case 'text-selection-65': openPageSelect64(step); break;
default: console.warn('MOS Popup: không nhận dạng popupType =',step.popupType);
    }
}


/* ============================================================
   1. POPUP TẠO BẢNG / CHUYỂN TEXT THÀNH BẢNG 
	//copy vào HTML, bật convertMode: true hiển thị cả 2 mục
	// Tắt convertMode: hiển thị duy nhất insert
popupType:   'create-table',  
popupAnswer:{
       	autoFixed:false,
       	autoContents:false,
       	autoWindow:false,
       	convertMode: true,          
       	separateAt:   'Paragraphs',   
       	otherChar:    ''  }},
   ============================================================
popupType:   'create-table',  
popupAnswer:{
       cols:2, 		//bỏ luôn để hs khỏi nhập
       rows:2,	//bỏ luôn để hs khỏi nhập
       autoFixed:true,
       autoContents:false,
       autoWindow:false,

       // chế độ Convert Text to Table ──
       convertMode:  false,          // true = mở dạng "Convert Text to Table"
       separateAt:   'Paragraphs',   // 'Paragraphs'|'Commas'|'Tabs'|'Other'
       otherChar:    '',             // ký tự tùy chỉnh khi separateAt = 'Other'
   }},
============================================================ */
function openCreateTablePopup(step){
    const ans = step.popupAnswer || {};
    const isConvert = ans.convertMode === true;

    const box = _createPopupShell(isConvert ? 'Convert Text to Table' : 'Insert Table');
    const body = document.createElement('div');
    body.className = 'mos-popup-body';

    /* Giải mã Separate text at (chỉ dùng khi convertMode) */
    const ansSeparate = ans.separateAt || 'Paragraphs';

    body.innerHTML = `
        <div>
<label>Number of columns:</label>
            <input type="number"
                   id="pp_cols"
                   min="1"
                   max="63"
                   value="${isConvert ? '' : 2}"
                   ${isConvert ? 'placeholder="Tự động theo văn bản"' : ''}>
        </div>

        <div>
            <label>Number of rows:</label>
            <input type="number"
                   id="pp_rows"
                   min="1"
                   max="999"
                   value="${isConvert ? '' : 1}"
                   ${isConvert ? 'placeholder="Tự động theo văn bản"' : ''}>
        </div>
        <div class="pp-group-title">
            AutoFit behavior
        </div>

        <div class="pp-radio-group">
            <label>
                <input type="radio"
                       name="pp_autofit"
                       value="Fixed">
                Fixed column width
            </label>
            <label>
                <input type="radio"
                       name="pp_autofit"
                       value="Contents">
                AutoFit to contents
            </label>
            <label>
                <input type="radio"
                       name="pp_autofit"
                       value="Window">
                AutoFit to window
            </label>
        </div>

        <!-- ══ MỚI: Separate text at — chỉ hiện khi Convert Text to Table ══ -->
        <div id="pp_separateSection" style="display:${isConvert ? 'flex' : 'none'};flex-direction:column;gap:6px;">
            <div class="pp-group-title">Separate text at</div>
            <div class="pp-radio-group">
                <label>
                    <input type="radio" name="pp_separateAt" value="Paragraphs" checked> Paragraphs
                </label>
                <label>
                    <input type="radio" name="pp_separateAt" value="Commas"> Commas
                </label>
                <label>
                    <input type="radio" name="pp_separateAt" value="Tabs"> Tabs
                </label>
                <label style="display:flex;align-items:center;gap:6px;">
                    <input type="radio" name="pp_separateAt" value="Other"> Other:
<input type="text" id="pp_otherChar" maxlength="1" value="" placeholder="nhập styles khác"
                        style="width:120px;padding:3px 6px;border:1px solid #94a3b8;border-radius:3px;
                               text-align:center;font-size:13px;">
                </label>
            </div>
        </div>

        <div class="pp-error" id="pp_err_table"></div>

        <div class="pp-btn-row">
            <button class="pp-btn pp-btn-cancel"
                    onclick="closeMosPopup()">
                Cancel
            </button>
            <button class="pp-btn pp-btn-ok"
                    onclick="checkCreateTablePopup()">
                OK
            </button>
        </div>
    `;

    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

    const autoFitAnswer =
          ans.autoFixed   ? 'Fixed'
        : ans.autoContents? 'Contents'
        : ans.autoWindow  ? 'Window'
        : '';

    window._ppAns = {
        cols: ans.cols || 0,
        rows: ans.rows || 0,
        autoFit: autoFitAnswer,
        /* ── MỚI ── */
        convertMode: isConvert,
        separateAt:  isConvert ? ansSeparate : undefined,
        otherChar:   isConvert && ansSeparate==='Other' ? (ans.otherChar||'') : undefined,
    };
}


function checkCreateTablePopup(){

    _hidePopupError('pp_err_table');
    const a = window._ppAns || {};
    const cols =
        parseInt(document.getElementById('pp_cols').value) || 0;

    const rows =
        parseInt(document.getElementById('pp_rows').value) || 0;

    const autoEl =
        document.querySelector(
            'input[name="pp_autofit"]:checked'
        );

    const autoFit =
        autoEl ? autoEl.value : '';

    let errors = [];

    /* Chỉ kiểm tra cols/rows khi KHÔNG phải Convert Text to Table
       (vì ở chế độ Convert, số cột/dòng do Word tự tính theo văn bản) */
    if(!a.convertMode){
        if(a.cols && cols !== a.cols){
            errors.push('Số cột→' + a.cols);
        }

        if(a.rows && rows !== a.rows){
            errors.push('Số dòng→' + a.rows);
        }
    }

    if(a.autoFit && autoFit !== a.autoFit){
        errors.push('AutoFit→' + a.autoFit);
    }

    /* ── MỚI: kiểm tra Separate text at khi ở chế độ Convert ── */
    if(a.convertMode){
        const sepEl = document.querySelector('input[name="pp_separateAt"]:checked');
        const sep   = sepEl ? sepEl.value : '';

        if(a.separateAt && sep !== a.separateAt){
            errors.push('Separate text at→' + a.separateAt);
        }

        if(a.separateAt === 'Other'){
            const otherVal = (document.getElementById('pp_otherChar')||{}).value || '';
            if(a.otherChar !== undefined && otherVal !== a.otherChar){
                errors.push('Other character→"' + a.otherChar + '"');
            }
        }
    }

    if(errors.length){
        _showPopupError(
            'pp_err_table',
            '❌ Chưa đúng! ' + errors.join(' | ')
        );
        return;
    }

    closeMosPopup();
    checkCorrect();
}

/* ============================================================
   02. POPUP COLUMNS (không copy //, lineBetween:false -> ko check là đúng, viết thường, không thấy ok)
   ============================================================
popupType:   'columns-popup',   
popupAnswer: {
       numCols1:false,	numCols2: true,	numCols3: false,	lineBetween:false,
       col1width: 0,	col1spacing: 0,	col2width: 0, 	col2spacing: 0,  
       applyWhole: true,	applyForward: false,     } },
============================================================ */
function openColumnsPopup(step){
    const box = _createPopupShell('Columns');
    const ans = step.popupAnswer || {};

    const ansNumCols = ans.numCols1 ? 1
                     : ans.numCols2 ? 2
                     : ans.numCols3 ? 3 : 0;
    const ansApply   = ans.applyWhole   ? 'Whole document'
                     : ans.applyForward ? 'This point forward' : '';

window._ppAns = {
    numCols:     ansNumCols,

    lineBetween:
        ('lineBetween' in ans)
        ? ans.lineBetween
        : undefined,

    col1width:   ('col1width'   in ans) ? ans.col1width   : undefined,
    col1spacing: ('col1spacing' in ans) ? ans.col1spacing : undefined,
    col2width:   ('col2width'   in ans) ? ans.col2width   : undefined,
    col2spacing: ('col2spacing' in ans) ? ans.col2spacing : undefined,
    applyTo:     ansApply,
};

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.innerHTML = `
        <div>
            <label>Number of columns:</label>
            <input type="number" id="pp_numCols" min="1" max="12" value="0" placeholder="Nhập số cột...">
        </div>
        <div class="pp-check-group">
            <label><input type="checkbox" id="pp_lineBetween"> Line between</label>
        </div>
        <div class="pp-group-title">Width and spacing</div>
        <table class="pp-table">
            <tr><th>Col #</th><th>Width</th><th>Spacing</th></tr>
            <tr>
                <td>1</td>
                <td><input type="number" id="pp_col1width"   value="0" placeholder="0.00"></td>
                <td><input type="number" id="pp_col1spacing" value="0" placeholder="0.00"></td>
            </tr>
            <tr>
                <td>2</td>
                <td><input type="number" id="pp_col2width"   value="0" placeholder="0.00"></td>
                <td><input type="number" id="pp_col2spacing" value="0" placeholder="0.00"></td>
            </tr>
        </table>
        <div class="pp-group-title">Apply to:</div>
        <select id="pp_applyTo">

            <option value="Whole document">Whole document</option>
            <option value="This point forward">This point forward</option>
        </select>
        <div class="pp-error" id="pp_err_cols"></div>
        <div class="pp-btn-row">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
            <button class="pp-btn pp-btn-ok" onclick="checkColumnsPopup()">OK</button>
        </div>`;
    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});
}
function checkColumnsPopup(){
    _hidePopupError('pp_err_cols');
    const a    = window._ppAns||{};
    const cols = parseInt(document.getElementById('pp_numCols').value)||0;
const lineBetween =
document.getElementById('pp_lineBetween').checked;
    const c1w  = parseFloat(document.getElementById('pp_col1width').value);
    const c1s  = parseFloat(document.getElementById('pp_col1spacing').value);
    const c2w  = parseFloat(document.getElementById('pp_col2width').value);
    const c2s  = parseFloat(document.getElementById('pp_col2spacing').value);
    const apply= document.getElementById('pp_applyTo').value;
    let errors=[];
    if(a.numCols     && cols!==a.numCols)                         errors.push('Số cột→'+a.numCols);
if(
    a.lineBetween !== undefined &&
    lineBetween !== a.lineBetween
){
    errors.push(
        'Line between→'
        + (a.lineBetween ? 'Checked' : 'Unchecked')
    );
}
    if(a.col1width   !==undefined&&(isNaN(c1w)||c1w!==a.col1width))   errors.push('Col1 Width→'+a.col1width);
    if(a.col1spacing !==undefined&&(isNaN(c1s)||c1s!==a.col1spacing)) errors.push('Col1 Spacing→'+a.col1spacing);
    if(a.col2width   !==undefined&&(isNaN(c2w)||c2w!==a.col2width))   errors.push('Col2 Width→'+a.col2width);
    if(a.col2spacing !==undefined&&(isNaN(c2s)||c2s!==a.col2spacing)) errors.push('Col2 Spacing→'+a.col2spacing);
    if(a.applyTo     && apply!==a.applyTo)                        errors.push('Apply→'+a.applyTo);
    if(errors.length){_showPopupError('pp_err_cols','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   03. POPUP TAB //copy Answer vào HTML
   ============================================================
popupType:   'tab-popup',   
popupAnswer: {
       tabStop: 3,
       alignLeft:false, alignCenter:false, alignRight:true,
       alignDecimal:false, alignBar:false,
       leaderNone:true, leaderDots:false, leaderDash:false, leaderUnderline:false,
   }},
============================================================ */
function openTabPopup(step){
    const box = _createPopupShell('Tabs');
    const ans = step.popupAnswer || {};

    const ansAlign  = ans.alignLeft    ? 'Left'
                    : ans.alignCenter  ? 'Center'
                    : ans.alignRight   ? 'Right'
                    : ans.alignDecimal ? 'Decimal'
                    : ans.alignBar     ? 'Bar' : '';
    const ansLeader = ans.leaderNone      ? 'None'
                    : ans.leaderDots      ? 'Dots'
                    : ans.leaderDash      ? 'Dash'
                    : ans.leaderUnderline ? 'Underline' : '';

    window._ppAns = {
        tabStop: ('tabStop' in ans) ? ans.tabStop : undefined,
        align:   ansAlign,
        leader:  ansLeader,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.innerHTML = `
        <div class="pp-grid-2">
            <div class="pp-grid-item">
                <label>Tab stop position:</label>
                <input type="number" id="pp_tabStop" value="0" placeholder="Nhập giá trị...">
            </div>
            <div class="pp-grid-item">
                <label>Default tab stops:</label>
                <input type="number" id="pp_defaultTab" value="1.27">
            </div>
        </div>
        <div class="pp-grid-2" style="align-items:start;margin-top:6px;">
            <div>
                <div class="pp-group-title">Alignment</div>
                <div class="pp-radio-group">
                    <label><input type="radio" name="pp_align" value="Left"> Left</label>
                    <label><input type="radio" name="pp_align" value="Center"> Center</label>
                    <label><input type="radio" name="pp_align" value="Right"> Right</label>
                    <label><input type="radio" name="pp_align" value="Decimal"> Decimal</label>
                    <label><input type="radio" name="pp_align" value="Bar"> Bar</label>
                </div>
            </div>
            <div>
                <div class="pp-group-title">Leader</div>
                <div class="pp-radio-group">
                    <label><input type="radio" name="pp_leader" value="None"> 1. None</label>
                    <label><input type="radio" name="pp_leader" value="Dots"> 2. ......</label>
                    <label><input type="radio" name="pp_leader" value="Dash"> 3. ------</label>
                    <label><input type="radio" name="pp_leader" value="Underline"> 4. _ _ _ _</label>
                </div>
            </div>
        </div>
        <div class="pp-error" id="pp_err_tab"></div>
        <div class="pp-btn-row pp-btn-row-set">
            <button class="pp-btn" onclick="closeMosPopup()">Set</button>
            <button class="pp-btn" onclick="closeMosPopup()">Clear</button>
            <button class="pp-btn" onclick="closeMosPopup()">Clear All</button>
        </div>
        <div class="pp-btn-row">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
            <button class="pp-btn pp-btn-ok" onclick="checkTabPopup()">OK</button>
        </div>`;
    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

/* Mặc định chọn Left */
document.querySelector(
    'input[name="pp_align"][value="Left"]'
).checked = true;

/* Mặc định chọn None */
document.querySelector(
    'input[name="pp_leader"][value="None"]'
).checked = true;
}
function checkTabPopup(){
    _hidePopupError('pp_err_tab');
    const a       = window._ppAns||{};
    const tab     = parseFloat(document.getElementById('pp_tabStop').value);
    const alignEl = document.querySelector('input[name="pp_align"]:checked');
    const align   = alignEl ? alignEl.value : '';
    const leadEl  = document.querySelector('input[name="pp_leader"]:checked');
    const leader  = leadEl ? leadEl.value : '';
    let errors=[];
    if(a.tabStop!==undefined&&(isNaN(tab)||tab!==a.tabStop)) errors.push('Tab stop→'+a.tabStop);
    if(a.align   && align!==a.align)   errors.push('Alignment→'+a.align);
    if(a.leader  && leader!==a.leader) errors.push('Leader→'+a.leader);
    if(errors.length){_showPopupError('pp_err_tab','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   04. POPUP PAGE SETUP — 3 TAB: MARGINS / PAPER / LAYOUT //copy từng tab vào HTML
popupType: 'page-setup',
popupAnswer: {
  visibleTabs: ['Margins'],   
  top: 2.54, bottom: 2.54, left: 3.17, right: 3.17,
  gutter: 0,  gutterPos: 'Left',         
  orientation: 'Portrait',
  multiplePages: 'Normal', 
  applyTo: 'Whole document'    }}, 

popupType: 'page-setup',
popupAnswer: {
  visibleTabs: ['Paper'],                  
  	paperSize: 'A4',                     
  	paperWidth: 21,   paperHeight: 29.7,   
  applyTo: 'Whole document'      }}, 

popupType: 'page-setup',
popupAnswer: {
  visibleTabs: ['Layout'],       
  		sectionStart: 'New page',                
  		differentOddEven: false,
  		differentFirstPage: false,
  		headerFromEdge: 1.27,
  		footerFromEdge: 1.27,
  		vertAlign: 'Center',                        
  applyTo: 'Whole document'    }},

   ============================================================
popupType: 'page-setup',
popupAnswer: {
  // ── Tab Margins ──
  top: 2.54, bottom: 2.54, left: 3.17, right: 3.17,
  gutter: 0,  gutterPos: 'Left',            // 'Left' | 'Top'
  orientation: 'Portrait',                   // 'Portrait' | 'Landscape'
  multiplePages: 'Normal',                   // 'Normal'|'Mirror margins'|'2 pages per sheet'|'Book fold'

  // ── Tab Paper ──
  paperSize: 'A4',                           // 'Letter'|'A4'|'Legal'|'A5'|'Custom size'
  paperWidth: 21,   paperHeight: 29.7,       // chỉ cần khi paperSize:'Custom size'

  // ── Tab Layout ──
  sectionStart: 'New page',                  // 'New page'|'Continuous'|'Even page'|'Odd page'
  differentOddEven: false,
  differentFirstPage: false,
  headerFromEdge: 1.27,
  footerFromEdge: 1.27,
  vertAlign: 'Top',                          // 'Top'|'Center'|'Justified'|'Bottom'

  // ── Chung — Apply to (hiện 1 lần, dùng chung cho cả 3 tab) ──
  applyTo: 'Whole document',                 // 'Whole document'|'This point forward'
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
/* ── Giá trị hiển thị mặc định khi MỞ popup — CỐ ĐỊNH, không đọc từ ans (tránh lộ đáp án) ── */
const _PS_DEFAULTS = {
    top: 2.54, bottom: 2.54, left: 3.17, right: 3.17,
    gutter: 0, gutterPos: 'Left',
    orientation: 'Portrait',
    multiplePages: 'Normal',
    paperSize: 'A4',
    paperWidth: 21, paperHeight: 29.7,
    sectionStart: 'New page',
    differentOddEven: false,
    differentFirstPage: false,
    headerFromEdge: 1.27,
    footerFromEdge: 1.27,
    vertAlign: 'Top',
    applyTo: 'Whole document',
};

function openPageSetupPopup(step){
    const box = _createPopupShell('Page Setup');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        top:    ('top'    in ans) ? ans.top    : undefined,
        bottom: ('bottom' in ans) ? ans.bottom : undefined,
        left:   ('left'   in ans) ? ans.left   : undefined,
        right:  ('right'  in ans) ? ans.right  : undefined,
        gutter: ('gutter' in ans) ? ans.gutter : undefined,
        gutterPos:     ('gutterPos'     in ans) ? ans.gutterPos     : undefined,
        orientation:   ('orientation'   in ans) ? ans.orientation   : undefined,
        multiplePages: ('multiplePages' in ans) ? ans.multiplePages : undefined,

        paperSize:   ('paperSize'   in ans) ? ans.paperSize   : undefined,
        paperWidth:  ('paperWidth'  in ans) ? ans.paperWidth  : undefined,
        paperHeight: ('paperHeight' in ans) ? ans.paperHeight : undefined,

        sectionStart:       ('sectionStart'       in ans) ? ans.sectionStart       : undefined,
        differentOddEven:   ('differentOddEven'   in ans) ? ans.differentOddEven   : undefined,
        differentFirstPage: ('differentFirstPage' in ans) ? ans.differentFirstPage : undefined,
        headerFromEdge:     ('headerFromEdge'     in ans) ? ans.headerFromEdge     : undefined,
        footerFromEdge:     ('footerFromEdge'     in ans) ? ans.footerFromEdge     : undefined,
        vertAlign:          ('vertAlign'          in ans) ? ans.vertAlign          : undefined,

        applyTo: ('applyTo' in ans) ? ans.applyTo : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:560px;max-width:640px;gap:0;padding:0;font-size:14px;';

/* ── Tab bar — MỚI: cho phép ẩn bớt tab qua ans.visibleTabs ── */
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;border-bottom:2px solid #94a3b8;padding:0 10px;background:#f1f5f9;';
    const _psAllTabs = ['Margins','Paper','Layout'];
    const _psTabs = (Array.isArray(ans.visibleTabs) && ans.visibleTabs.length)
        ? _psAllTabs.filter(function(t){ return ans.visibleTabs.indexOf(t) !== -1; })
        : _psAllTabs;
    const tabEls = {};
    _psTabs.forEach(function(t){
        const td = document.createElement('div');
        td.textContent = t;
        td.style.cssText = 'padding:7px 16px;cursor:pointer;font-size:14px;'
            +'border:1px solid transparent;border-bottom:none;margin-bottom:-2px;'
            +'border-radius:3px 3px 0 0;color:#374151;';
        td.addEventListener('click', function(){ pp_psSetTab(t); });
        tabBar.appendChild(td);
        tabEls[t] = td;
    });
    body.appendChild(tabBar);

    /* ── Content scroll area ── */
    const content = document.createElement('div');
    content.style.cssText = 'padding:14px 16px;max-height:60vh;overflow-y:auto;';
    body.appendChild(content);

    /* ══ PANEL 1: MARGINS ══ */
    const panelMargins = document.createElement('div');
    panelMargins.id = 'pp_ps_panel_margins';
    panelMargins.style.cssText = 'display:grid;grid-template-columns:1fr 200px;gap:14px;align-items:start;';
    panelMargins.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div class="pp-group-title" style="margin-top:0;">Margins</div>
        <div style="display:grid;grid-template-columns:auto 90px auto 90px;gap:6px 10px;align-items:center;">
          <label>Top:</label>
          <input type="number" id="pp_ps_top" step="0.01" value="2.54">
          <label>Bottom:</label>
          <input type="number" id="pp_ps_bottom" step="0.01" value="2.54">
          <label>Left:</label>
          <input type="number" id="pp_ps_left" step="0.01" value="3.17">
          <label>Right:</label>
          <input type="number" id="pp_ps_right" step="0.01" value="3.17">
          <label>Gutter:</label>
          <input type="number" id="pp_ps_gutter" step="0.01" value="0">
          <label>Gutter position:</label>
          <select id="pp_ps_gutterPos">
              <option value="Left">Left</option>
              <option value="Top">Top</option>
          </select>
        </div>

        <div class="pp-group-title">Orientation</div>
        <div style="display:flex;gap:16px;">
          <div id="pp_ps_orient_portrait" onclick="pp_psSelectOrientation('Portrait')"
              style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;
                     padding:6px 10px;border-radius:5px;border:2px solid #2563eb;background:#dbeafe;">
              <div style="width:26px;height:34px;background:#fff;border:1px solid #94a3b8;border-radius:2px;"></div>
              <span style="font-size:14px;">Portrait</span>
          </div>
          <div id="pp_ps_orient_landscape" onclick="pp_psSelectOrientation('Landscape')"
              style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;
                     padding:6px 10px;border-radius:5px;border:2px solid #e2e8f0;background:#f8fafc;">
              <div style="width:34px;height:26px;background:#fff;border:1px solid #94a3b8;border-radius:2px;"></div>
              <span style="font-size:14px;">Landscape</span>
          </div>
        </div>

        <div class="pp-group-title">Pages</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
          <label>Multiple pages:</label>
          <select id="pp_ps_multiplePages">
              <option value="Normal">Normal</option>
              <option value="Mirror margins">Mirror margins</option>
              <option value="2 pages per sheet">2 pages per sheet</option>
              <option value="Book fold">Book fold</option>
          </select>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
        <div class="pp-group-title" style="margin-top:0;">Preview</div>
        <div id="pp_ps_previewMargins"
            style="width:90px;height:120px;border:1px solid #94a3b8;background:#fff;
                   position:relative;box-shadow:1px 1px 4px rgba(0,0,0,0.1);">
            <div style="position:absolute;inset:14px;border:1px dashed #cbd5e1;"></div>
        </div>
      </div>`;
    content.appendChild(panelMargins);

    /* ══ PANEL 2: PAPER ══ */
    const panelPaper = document.createElement('div');
    panelPaper.id = 'pp_ps_panel_paper';
    panelPaper.style.cssText = 'display:none;grid-template-columns:1fr 200px;gap:14px;align-items:start;';
    panelPaper.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div class="pp-group-title" style="margin-top:0;">Paper</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
          <label>Paper size:</label>
          <select id="pp_ps_paperSize" onchange="pp_psToggleCustomSize()">
              <option value="Letter">Letter</option>
              <option value="A4">A4</option>
              <option value="Legal">Legal</option>
              <option value="A5">A5</option>
              <option value="Custom size">Custom size</option>
          </select>
          <label id="pp_ps_widthLabel" style="color:#94a3b8;">Width:</label>
          <input type="number" id="pp_ps_paperWidth" step="0.01" value="21" disabled class="pp-disabled">
          <label id="pp_ps_heightLabel" style="color:#94a3b8;">Height:</label>
          <input type="number" id="pp_ps_paperHeight" step="0.01" value="29.7" disabled class="pp-disabled">
        </div>

        <div class="pp-group-title">Paper source</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
          <label>First page:</label>
          <select id="pp_ps_trayFirst">
              <option>Default tray (Automatically Select)</option>
          </select>
          <label>Other pages:</label>
          <select id="pp_ps_trayOther">
              <option>Default tray (Automatically Select)</option>
          </select>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
        <div class="pp-group-title" style="margin-top:0;">Preview</div>
        <div id="pp_ps_previewPaper"
            style="width:90px;height:120px;border:1px solid #94a3b8;background:#fff;
                   box-shadow:1px 1px 4px rgba(0,0,0,0.1);"></div>
      </div>`;
    content.appendChild(panelPaper);

    /* ══ PANEL 3: LAYOUT ══ */
    const panelLayout = document.createElement('div');
    panelLayout.id = 'pp_ps_panel_layout';
    panelLayout.style.cssText = 'display:none;grid-template-columns:1fr 1fr;gap:14px;align-items:start;';
    panelLayout.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div class="pp-group-title" style="margin-top:0;">Section</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
          <label>Section start:</label>
          <select id="pp_ps_sectionStart">
              <option value="New page">New page</option>
              <option value="Continuous">Continuous</option>
              <option value="Even page">Even page</option>
              <option value="Odd page">Odd page</option>
          </select>
        </div>
        <label style="display:flex;align-items:center;gap:6px;color:#94a3b8;">
            <input type="checkbox" id="pp_ps_suppressEndnotes" disabled> Suppress endnotes
        </label>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        <div class="pp-group-title" style="margin-top:0;">Headers and footers</div>
        <label style="display:flex;align-items:center;gap:6px;">
            <input type="checkbox" id="pp_ps_diffOddEven"> Different odd and even
        </label>
        <label style="display:flex;align-items:center;gap:6px;">
            <input type="checkbox" id="pp_ps_diffFirstPage"> Different first page
        </label>
        <div style="display:grid;grid-template-columns:auto auto 70px;gap:5px 8px;align-items:center;">
            <label style="white-space:nowrap;">From edge:</label>
            <label>Header:</label>
            <input type="number" id="pp_ps_headerEdge" step="0.01" value="1.27">
            <span></span>
            <label>Footer:</label>
            <input type="number" id="pp_ps_footerEdge" step="0.01" value="1.27">
        </div>

        <div class="pp-group-title">Page</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
            <label>Vertical alignment:</label>
            <select id="pp_ps_vertAlign">
                <option value="Top">Top</option>
                <option value="Center">Center</option>
                <option value="Justified">Justified</option>
                <option value="Bottom">Bottom</option>
            </select>
        </div>
      </div>`;
    content.appendChild(panelLayout);

    /* ── Apply to (dùng chung cho cả 3 tab, hiện cố định dưới cùng) ── */
    const applyRow = document.createElement('div');
    applyRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 16px 0;border-top:1px solid #e2e8f0;margin-top:6px;';
    applyRow.innerHTML = `
        <label style="white-space:nowrap;">Apply to:</label>
        <select id="pp_ps_applyTo" style="flex:1;">
            <option value="Whole document">Whole document</option>
            <option value="This point forward">This point forward</option>
        </select>`;
    body.appendChild(applyRow);

    /* Error */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_page';
    errDiv.style.margin = '8px 16px 0';
    body.appendChild(errDiv);

    /* Nút hành động */
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;'
        +'padding:10px 16px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn" style="opacity:0.5;cursor:not-allowed;" disabled>Set As Default</button>
        <div style="display:flex;gap:8px;">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
            <button class="pp-btn pp-btn-ok" onclick="checkPageSetupPopup()">OK</button>
        </div>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button,div,span').forEach(function(el){
        el.style.fontSize = '14px';
    });

    /* ── Set giá trị hiển thị mặc định — LUÔN dùng _PS_DEFAULTS, KHÔNG đọc từ ans ── */
    window._ppPsTabEls = tabEls;
    setTimeout(function(){
        document.getElementById('pp_ps_top').value    = _PS_DEFAULTS.top;
        document.getElementById('pp_ps_bottom').value = _PS_DEFAULTS.bottom;
        document.getElementById('pp_ps_left').value   = _PS_DEFAULTS.left;
        document.getElementById('pp_ps_right').value  = _PS_DEFAULTS.right;
        document.getElementById('pp_ps_gutter').value = _PS_DEFAULTS.gutter;
        document.getElementById('pp_ps_gutterPos').value = _PS_DEFAULTS.gutterPos;
        document.getElementById('pp_ps_multiplePages').value = _PS_DEFAULTS.multiplePages;
        pp_psSelectOrientation(_PS_DEFAULTS.orientation);

        document.getElementById('pp_ps_paperSize').value = _PS_DEFAULTS.paperSize;
        document.getElementById('pp_ps_paperWidth').value  = _PS_DEFAULTS.paperWidth;
        document.getElementById('pp_ps_paperHeight').value = _PS_DEFAULTS.paperHeight;
        pp_psToggleCustomSize();

        document.getElementById('pp_ps_sectionStart').value = _PS_DEFAULTS.sectionStart;
        document.getElementById('pp_ps_diffOddEven').checked    = _PS_DEFAULTS.differentOddEven;
        document.getElementById('pp_ps_diffFirstPage').checked  = _PS_DEFAULTS.differentFirstPage;
        document.getElementById('pp_ps_headerEdge').value = _PS_DEFAULTS.headerFromEdge;
        document.getElementById('pp_ps_footerEdge').value = _PS_DEFAULTS.footerFromEdge;
        document.getElementById('pp_ps_vertAlign').value = _PS_DEFAULTS.vertAlign;

        document.getElementById('pp_ps_applyTo').value = _PS_DEFAULTS.applyTo;

pp_psSetTab(_psTabs[0] || 'Margins');
    }, 0);
}

/* ── Chuyển tab (Margins / Paper / Layout) ── */
function pp_psSetTab(tab){
    const tabEls = window._ppPsTabEls || {};
    ['Margins','Paper','Layout'].forEach(function(t){
        const el = tabEls[t];
        if(!el){return;}
        if(t===tab){
            el.style.background   = '#fff';
            el.style.border       = '1px solid #94a3b8';
            el.style.borderBottom = '2px solid #fff';
            el.style.fontWeight   = 'bold';
            el.style.color        = '#1e3a5f';
        } else {
            el.style.background   = '';
            el.style.border       = '1px solid transparent';
            el.style.fontWeight   = 'normal';
            el.style.color        = '#374151';
        }
    });
    const pm = document.getElementById('pp_ps_panel_margins');
    const pp = document.getElementById('pp_ps_panel_paper');
    const pl = document.getElementById('pp_ps_panel_layout');
    if(pm) pm.style.display = (tab==='Margins') ? 'grid' : 'none';
    if(pp) pp.style.display = (tab==='Paper')   ? 'grid' : 'none';
    if(pl) pl.style.display = (tab==='Layout')  ? 'grid' : 'none';
    window._ppPsActiveTab = tab;
}

/* ── Chọn Orientation (Portrait/Landscape) — đổi khung Preview theo hướng trang ── */
function pp_psSelectOrientation(val){
    window._ppPsOrientation = val;
    const p = document.getElementById('pp_ps_orient_portrait');
    const l = document.getElementById('pp_ps_orient_landscape');
    if(p){ p.style.border = (val==='Portrait')  ? '2px solid #2563eb' : '2px solid #e2e8f0';
           p.style.background = (val==='Portrait') ? '#dbeafe' : '#f8fafc'; }
    if(l){ l.style.border = (val==='Landscape') ? '2px solid #2563eb' : '2px solid #e2e8f0';
           l.style.background = (val==='Landscape') ? '#dbeafe' : '#f8fafc'; }

    const prev = document.getElementById('pp_ps_previewMargins');
    if(prev){
        if(val==='Landscape'){ prev.style.width='120px'; prev.style.height='90px'; }
        else{ prev.style.width='90px'; prev.style.height='120px'; }
    }
}

/* ── Bật/tắt ô Width/Height khi chọn Custom size, đổi Preview khổ giấy ── */
function pp_psToggleCustomSize(){
    const sel = document.getElementById('pp_ps_paperSize');
    const w = document.getElementById('pp_ps_paperWidth');
    const h = document.getElementById('pp_ps_paperHeight');
    const wl = document.getElementById('pp_ps_widthLabel');
    const hl = document.getElementById('pp_ps_heightLabel');
    if(!sel||!w||!h){return;}
    const isCustom = (sel.value === 'Custom size');
    w.disabled = !isCustom; h.disabled = !isCustom;
    w.className = isCustom?'':'pp-disabled'; h.className = isCustom?'':'pp-disabled';
    if(wl) wl.style.color = isCustom?'#374151':'#94a3b8';
    if(hl) hl.style.color = isCustom?'#374151':'#94a3b8';

    const prev = document.getElementById('pp_ps_previewPaper');
    if(prev){
        const ratios = { 'Letter':[85,110], 'A4':[90,127], 'Legal':[80,127], 'A5':[70,100], 'Custom size':[90,120] };
        const r = ratios[sel.value] || [90,120];
        prev.style.width  = r[0]+'px';
        prev.style.height = r[1]+'px';
    }
}

function checkPageSetupPopup(){
    _hidePopupError('pp_err_page');
    const a = window._ppAns||{};

    const top    = parseFloat(document.getElementById('pp_ps_top').value);
    const bottom = parseFloat(document.getElementById('pp_ps_bottom').value);
    const left   = parseFloat(document.getElementById('pp_ps_left').value);
    const right  = parseFloat(document.getElementById('pp_ps_right').value);
    const gutter = parseFloat(document.getElementById('pp_ps_gutter').value);
    const gutterPos     = document.getElementById('pp_ps_gutterPos').value;
    const orientation   = window._ppPsOrientation || 'Portrait';
    const multiplePages = document.getElementById('pp_ps_multiplePages').value;

    const paperSize   = document.getElementById('pp_ps_paperSize').value;
    const paperWidth  = parseFloat(document.getElementById('pp_ps_paperWidth').value);
    const paperHeight = parseFloat(document.getElementById('pp_ps_paperHeight').value);

    const sectionStart       = document.getElementById('pp_ps_sectionStart').value;
    const differentOddEven   = document.getElementById('pp_ps_diffOddEven').checked;
    const differentFirstPage = document.getElementById('pp_ps_diffFirstPage').checked;
    const headerFromEdge = parseFloat(document.getElementById('pp_ps_headerEdge').value);
    const footerFromEdge = parseFloat(document.getElementById('pp_ps_footerEdge').value);
    const vertAlign = document.getElementById('pp_ps_vertAlign').value;

    const applyTo = document.getElementById('pp_ps_applyTo').value;

    let errors=[];
    if(a.top    !==undefined&&(isNaN(top)   ||top   !==a.top))    errors.push('Top→'+a.top);
    if(a.bottom !==undefined&&(isNaN(bottom)||bottom!==a.bottom)) errors.push('Bottom→'+a.bottom);
    if(a.left   !==undefined&&(isNaN(left)  ||left  !==a.left))   errors.push('Left→'+a.left);
    if(a.right  !==undefined&&(isNaN(right) ||right !==a.right))  errors.push('Right→'+a.right);
    if(a.gutter !==undefined&&(isNaN(gutter)||gutter!==a.gutter)) errors.push('Gutter→'+a.gutter);
    if(a.gutterPos     && gutterPos    !==a.gutterPos)     errors.push('Gutter position→'+a.gutterPos);
    if(a.orientation   && orientation  !==a.orientation)   errors.push('Orientation→'+a.orientation);
    if(a.multiplePages && multiplePages!==a.multiplePages) errors.push('Multiple pages→'+a.multiplePages);

    if(a.paperSize   && paperSize   !==a.paperSize)                                    errors.push('Paper size→'+a.paperSize);
    if(a.paperWidth  !==undefined&&(isNaN(paperWidth) ||paperWidth !==a.paperWidth))    errors.push('Width→'+a.paperWidth);
    if(a.paperHeight !==undefined&&(isNaN(paperHeight)||paperHeight!==a.paperHeight))   errors.push('Height→'+a.paperHeight);

    if(a.sectionStart       && sectionStart      !==a.sectionStart)       errors.push('Section start→'+a.sectionStart);
    if(a.differentOddEven   !==undefined&&differentOddEven  !==a.differentOddEven)   errors.push('Different odd/even→'+a.differentOddEven);
    if(a.differentFirstPage !==undefined&&differentFirstPage!==a.differentFirstPage) errors.push('Different first page→'+a.differentFirstPage);
    if(a.headerFromEdge!==undefined&&(isNaN(headerFromEdge)||headerFromEdge!==a.headerFromEdge)) errors.push('Header→'+a.headerFromEdge);
    if(a.footerFromEdge!==undefined&&(isNaN(footerFromEdge)||footerFromEdge!==a.footerFromEdge)) errors.push('Footer→'+a.footerFromEdge);
    if(a.vertAlign && vertAlign!==a.vertAlign) errors.push('Vertical alignment→'+a.vertAlign);

    if(a.applyTo && applyTo!==a.applyTo) errors.push('Apply to→'+a.applyTo);

    if(errors.length){_showPopupError('pp_err_page','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
  05. POPUP INDENT OF TAB LAYOUT (Nhóm lựa chọn thẻ Layout, copy vào HTML)
   ============================================================
popupType:'indent-popup',   
popupAnswer: { left:0, right:0, before:0, after:0 }
============================================================ */
function openIndentPopup(step){
    const box = _createPopupShell('Paragraph');
    const ans = step.popupAnswer || {};
    window._ppAns = {
        left:   ('left'   in ans) ? ans.left   : undefined,
        right:  ('right'  in ans) ? ans.right  : undefined,
        before: ('before' in ans) ? ans.before : undefined,
        after:  ('after'  in ans) ? ans.after  : undefined,
    };
    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.innerHTML = `
<div class="pp-group-title" style="margin-top:0px;font-size:14px;">Indentation</div> 
        <div class="pp-grid-2">
            <div class="pp-grid-item">
<label style="font-size:16px;">Left:</label>
<input type="number" id="pp_indLeft" step="0.1" value="0" placeholder="0.0" style="font-size:16px;">
            </div>
<div class="pp-grid-item">
    <label style="font-size:16px;">Right:</label>
    <input type="number" id="pp_indRight" step="0.1" value="0" placeholder="0.0" style="font-size:16px;">
</div>
        </div>
<div class="pp-group-title" style="margin-top:0px;font-size:14px;">Spacing</div>
        <div class="pp-grid-2">
<div class="pp-grid-item">
    <label style="font-size:16px;">Before (pt):</label>
    <input type="number" id="pp_spBefore" value="0" placeholder="0" style="font-size:16px;">
</div>
<div class="pp-grid-item">
    <label style="font-size:16px;">After (pt):</label>
    <input type="number" id="pp_spAfter" value="0" placeholder="0" style="font-size:16px;">
</div>
        </div>
        <div class="pp-error" id="pp_err_indent"></div>
        <div class="pp-btn-row">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
            <button class="pp-btn pp-btn-ok" onclick="checkIndentPopup()">OK</button>
        </div>`;
    box.appendChild(body);
}
function checkIndentPopup(){
    _hidePopupError('pp_err_indent');
    const a      = window._ppAns||{};
    const left   = parseFloat(document.getElementById('pp_indLeft').value);
    const right  = parseFloat(document.getElementById('pp_indRight').value);
    const before = parseFloat(document.getElementById('pp_spBefore').value);
    const after  = parseFloat(document.getElementById('pp_spAfter').value);
    let errors=[];
    if(a.left  !==undefined&&(isNaN(left)  ||left  !==a.left))   errors.push('Left→'+a.left);
    if(a.right !==undefined&&(isNaN(right) ||right !==a.right))  errors.push('Right→'+a.right);
    if(a.before!==undefined&&(isNaN(before)||before!==a.before)) errors.push('Before→'+a.before+'pt');
    if(a.after !==undefined&&(isNaN(after) ||after !==a.after))  errors.push('After→'+a.after+'pt');
    if(errors.length){_showPopupError('pp_err_indent','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
  06. POPUP PARAGRAPH — INDENTS AND SPACING (tùy theo câu hỏi, sửa popupAnswer trong HTML là lsMultiple:false -> true)
-Value = 0 thì không cần nhập, by/at = 1 nhưng không bật "true" thì hộp thoại vẫn bỏ qua, copy vào HTML
   ============================================================
popupType:   'paragraph-spacing',  
 popupAnswer: {
       	alignLeft:true, alignCenter:false, alignRight:false, alignJustified:false,
       	outlineBodyText:true, outlineLevel1:false, outlineLevel2:false,
       	left:0,  right:0,
       	specialNone:false, specialFirstLine:true, specialHanging:false,       by:1,
       	before:0, after:0, lsSingle:false, ls15lines:false, lsDouble:false,
       	lsAtLeast:false, lsExactly:true, lsMultiple:true,        at:1.68 }},
   Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
function openParagraphSpacingPopup(step){
    const box = _createPopupShell('Paragraph');
    const ans = step.popupAnswer || {};

    const ansAlign   = ans.alignLeft    ? 'Left'
                     : ans.alignCenter  ? 'Center'
                     : ans.alignRight   ? 'Right'
                     : ans.alignJustified ? 'Justified' : '';
    const ansOutline = ans.outlineBodyText ? 'Body Text'
                     : ans.outlineLevel1   ? 'Level 1'
                     : ans.outlineLevel2   ? 'Level 2' : '';
    const ansSpecial = ans.specialNone      ? 'None'
                     : ans.specialFirstLine ? 'First line'
                     : ans.specialHanging   ? 'Hanging' : '';
    const ansLS      = ans.lsSingle   ? 'Single'
                     : ans.ls15lines  ? '1.5 lines'
                     : ans.lsDouble   ? 'Double'
                     : ans.lsAtLeast  ? 'At least'
                     : ans.lsExactly  ? 'Exactly'
                     : ans.lsMultiple ? 'Multiple' : '';

    window._ppAns = {
        alignment:   ansAlign,
        outline:     ansOutline,
        left:        ('left'   in ans) ? ans.left   : undefined,
        right:       ('right'  in ans) ? ans.right  : undefined,
        special:     ansSpecial,
        by:          ('by'     in ans) ? ans.by     : undefined,
        before:      ('before' in ans) ? ans.before : undefined,
        after:       ('after'  in ans) ? ans.after  : undefined,
        lineSpacing: ansLS,
        at:          ('at'     in ans) ? ans.at     : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.innerHTML = `
    <div class="pp-group-title" style="font-size:16px;">General</div>
    <div style="display:grid;grid-template-columns:auto 90px auto 90px;gap:1px 8px;align-items:center;margin-bottom:4px;">
        <label style="white-space:nowrap;">Alignment:</label>
        <select id="pp_align">

            <option value="Left">Left</option>
            <option value="Center">Center</option>
            <option value="Right">Right</option>
            <option value="Justify">Justified</option>
        </select>
        <label style="white-space:nowrap;">Outline level:</label>
        <select id="pp_outline">

            <option value="Body Text">Body Text</option>
            <option value="Level 1">Level 1</option>
            <option value="Level 2">Level 2</option>
        </select>
    </div>
    <div class="pp-group-title" style="font-size:16px;">Indentation</div>
    <div style="display:grid;grid-template-columns:auto 120px auto 90px auto 90px;gap:4px 8px;align-items:center;margin-bottom:4px;">
        <label>Left:</label>
        <input type="number" id="pp_left" step="0.01" value="0" placeholder="0">
        <label>Special:</label>
        <select id="pp_special" style="width:100%;" onchange="pp_toggleBy()">

            <option value="None">(none)</option>
            <option value="First line">First line</option>
            <option value="Hanging">Hanging</option>
        </select>
        <label id="pp_by_label" style="color:#94a3b8;">By:</label>
        <input type="number" id="pp_by" step="0.01" value="0" placeholder="0"
               disabled class="pp-disabled">
        <label>Right:</label>
        <input type="number" id="pp_right" step="0.01" value="0" placeholder="0">
        <span></span><span></span><span></span><span></span>
    </div>
    <div class="pp-group-title" style="font-size:16px;">Spacing</div>
    <div style="display:grid;grid-template-columns:auto 120px auto 90px auto 90px;gap:4px 8px;align-items:center;margin-bottom:4px;">
        <label>Before:</label>
        <input type="number" id="pp_before" value="0" placeholder="0">
        <label style="white-space:nowrap;">Line spacing:</label>
        <select id="pp_lineSpacing" style="width:100%;" onchange="pp_toggleAt()">

            <option value="1.5 lines">1.5 lines</option>
	<option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="At least">At least</option>
            <option value="Exactly">Exactly</option>
            <option value="Multiple">Multiple</option>
        </select>
        <label id="pp_at_label" style="color:#94a3b8;">At:</label>
        <input type="number" id="pp_at" step="0.01" placeholder="0"
               disabled class="pp-disabled">
        <label>After:</label>
        <input type="number" id="pp_after" value="0" placeholder="0">
        <span></span><span></span><span></span><span></span>
    </div>
    <div class="pp-error" id="pp_err_paragraph"></div>
    <div class="pp-btn-row">
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkParagraphSpacingPopup()">OK</button>
    </div>`;
box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';
});
}
function pp_toggleBy(){
    const sp=document.getElementById('pp_special');
    const bi=document.getElementById('pp_by');
    const bl=document.getElementById('pp_by_label');
    if(!sp||!bi){return;}
    const on=(sp.value==='First line'||sp.value==='Hanging');
    bi.disabled=!on; bi.className=on?'':'pp-disabled';
    bl.style.color=on?'#374151':'#94a3b8';
    if(!on){bi.value='';}
}
function pp_toggleAt(){
    const ls=document.getElementById('pp_lineSpacing');
    const ai=document.getElementById('pp_at');
    const al=document.getElementById('pp_at_label');
    if(!ls||!ai){return;}
    const on=['At least','Exactly','Multiple'].includes(ls.value);
    ai.disabled=!on; ai.className=on?'':'pp-disabled';
    al.style.color=on?'#374151':'#94a3b8';
    if(!on){ai.value='';}
}
function checkParagraphSpacingPopup(){
    _hidePopupError('pp_err_paragraph');
    const a         = window._ppAns||{};
    const alignment = document.getElementById('pp_align').value;
    const outline   = document.getElementById('pp_outline').value;
    const left      = parseFloat(document.getElementById('pp_left').value);
    const right     = parseFloat(document.getElementById('pp_right').value);
    const special   = document.getElementById('pp_special').value;
const byEl        = document.getElementById('pp_by');
const by          = (byEl&&!byEl.disabled&&byEl.value!=='')?parseFloat(byEl.value):undefined;
    const before    = parseFloat(document.getElementById('pp_before').value);
    const after     = parseFloat(document.getElementById('pp_after').value);
    const ls        = document.getElementById('pp_lineSpacing').value;
const atEl        = document.getElementById('pp_at');
const at          = (atEl&&!atEl.disabled&&atEl.value!=='')?parseFloat(atEl.value):undefined;
    let errors=[];
    if(a.alignment  &&alignment !==a.alignment)                        errors.push('Alignment→'+a.alignment);
    if(a.outline    &&outline   !==a.outline)                          errors.push('Outline→'+a.outline);
    if(a.left  !==undefined&&(isNaN(left)  ||left  !==a.left))        errors.push('Left→'+a.left);
    if(a.right !==undefined&&(isNaN(right) ||right !==a.right))       errors.push('Right→'+a.right);
    if(a.special    &&special   !==a.special)                          errors.push('Special→'+a.special);
if(a.by!==undefined&&a.special!=='None'&&a.special!==''&&(isNaN(by)||by!==a.by))  errors.push('By→'+a.by);
    if(a.before!==undefined&&(isNaN(before)||before!==a.before))       errors.push('Before→'+a.before);
    if(a.after !==undefined&&(isNaN(after) ||after !==a.after))        errors.push('After→'+a.after);
    if(a.lineSpacing&&ls!==a.lineSpacing)                              errors.push('Line spacing→'+a.lineSpacing);
if(a.at!==undefined&&['At least','Exactly','Multiple'].includes(a.lineSpacing)
       &&['At least','Exactly','Multiple'].includes(ls)){
        if(isNaN(at)||at!==a.at) errors.push('At→'+a.at);
    }   
    if(errors.length){_showPopupError('pp_err_paragraph','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}


/* ============================================================
   07. POPUP FONT & FONT SIZE //copy vào HTML
   ============================================================
popupType:   'font-size', 
popupAnswer: {
       fontArial:true, fontTimesNewRoman:false, fontCalibri:false,
       fontCalibriLight:false, fontCambria:false, fontTahoma:false, fontVerdana:false,
       size: 14, bold:false, italic:false, underline:false,
   }
============================================================ */
function openFontSizePopup(step){
    const box = _createPopupShell('Font');
    const ans = step.popupAnswer || {};

    const ansFont = ans.fontArial          ? 'Arial'
                  : ans.fontTimesNewRoman  ? 'Times New Roman'
                  : ans.fontCalibri        ? 'Calibri'
                  : ans.fontCalibriLight   ? 'Calibri Light'
                  : ans.fontCambria        ? 'Cambria'
                  : ans.fontTahoma         ? 'Tahoma'
                  : ans.fontVerdana        ? 'Verdana' : '';

    window._ppAns = {
        font:      ansFont,
        size:      ('size'      in ans) ? ans.size      : undefined,
        bold:      ('bold'      in ans) ? ans.bold      : undefined,
        italic:    ('italic'    in ans) ? ans.italic    : undefined,
        underline: ('underline' in ans) ? ans.underline : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.innerHTML = `
        <div>
            <label>Font:</label>
            <select id="pp_fontName" style="width:100%;">

                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Calibri">Calibri</option>
                <option value="Calibri Light">Calibri Light</option>
                <option value="Cambria">Cambria</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Verdana">Verdana</option>
            </select>
        </div>
        <div>
            <label>Font Size:</label>
            <input type="number" id="pp_fontSize" min="1" max="999" value="14" placeholder="Nhập cỡ chữ...">
        </div>
        <div class="pp-group-title">Font style</div>
        <div class="pp-check-group">
            <label><input type="checkbox" id="pp_bold">      Bold</label>
            <label><input type="checkbox" id="pp_italic">    Italic</label>
            <label><input type="checkbox" id="pp_underline"> Underline</label>
        </div>
        <div class="pp-error" id="pp_err_font"></div>
        <div class="pp-btn-row">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
            <button class="pp-btn pp-btn-ok" onclick="checkFontSizePopup()">OK</button>
        </div>`;
    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});
}
function checkFontSizePopup(){
    _hidePopupError('pp_err_font');
    const a    = window._ppAns||{};
    const font = document.getElementById('pp_fontName').value;
    const size = parseInt(document.getElementById('pp_fontSize').value);
    const bold = document.getElementById('pp_bold').checked;
    const ital = document.getElementById('pp_italic').checked;
    const und  = document.getElementById('pp_underline').checked;
    let errors=[];
    if(a.font      && font!==a.font)                         errors.push('Font→'+a.font);
    if(a.size!==undefined&&(isNaN(size)||size!==a.size))     errors.push('Size→'+a.size);
    if(a.bold!==undefined      &&bold!==a.bold)              errors.push('Bold→'+a.bold);
    if(a.italic!==undefined    &&ital!==a.italic)            errors.push('Italic→'+a.italic);
    if(a.underline!==undefined &&und!==a.underline)          errors.push('Underline→'+a.underline);
    if(errors.length){_showPopupError('pp_err_font','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
  08. POPUP SPELLING & GRAMMAR <false = ô để trống, câu hỏi yêu cầu check ô nào -> sửa true, có thể dùng 2 cái // copy HTML>
   ============================================================
popupType:   'spelling-grammar',   
popupAnswer: {
       checkSpelling:    false,
       markGrammar:      false,
       confusedWords:    false,
       checkGrammar:     false,
       writingStyleGrammar:      true, 
       writingStyleGrammarStyle: false,
       hideSpellingOnly: false,
       hideGrammarOnly: false, }},

popupType: 'spelling-grammar',
popupAnswer: {
    	checkSpelling: true }},

    showReadability: true   // hoặc false //thay lệnh khác tại window._ppAns = {
============================================================ */
function openSpellingGrammarPopup(step){
    const box = _createPopupShell('When correcting spelling and grammar in Word');
    const ans = step.popupAnswer || {};

    const ansStyle = ans.writingStyleGrammar      ? 'Grammar'
                   : ans.writingStyleGrammarStyle ? 'Grammar & Style' : '';

    window._ppAns = {
        checkSpelling:    ('checkSpelling'    in ans) ? ans.checkSpelling    : undefined,
        markGrammar:      ('markGrammar'      in ans) ? ans.markGrammar      : undefined,
        confusedWords:    ('confusedWords'    in ans) ? ans.confusedWords    : undefined,
        checkGrammar:     ('checkGrammar'     in ans) ? ans.checkGrammar     : undefined,
        showReadability:  ('showReadability'  in ans) ? ans.showReadability  : undefined,
        writingStyle:     ansStyle,
        hideSpellingOnly: ('hideSpellingOnly' in ans) ? ans.hideSpellingOnly : undefined,
        hideGrammarOnly:  ('hideGrammarOnly'  in ans) ? ans.hideGrammarOnly  : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start;">
            <div>
                <div class="pp-group-title" style="margin-top:0;">When correcting spelling and grammar in Word</div>
                <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
                    <label style="display:flex;align-items:center;gap:8px;font-size:16px;">
                        <input type="checkbox" id="pp_checkSpelling" >
                        Check spelling as you type
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:16px;">
                        <input type="checkbox" id="pp_markGrammar" >
                        Mark grammar errors as you type
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:16px;">
                        <input type="checkbox" id="pp_confusedWords" >
                        Frequently confused words
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:16px;">
                        <input type="checkbox" id="pp_checkGrammar" >
                        Check grammar with spelling
                    </label>
<label style="display:flex;align-items:center;gap:8px;font-size:16px;">
                        <input type="checkbox" id="pp_readability" >
                        Show readability statistics
                    </label>
                </div>
                <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                    <label style="font-size:12px;white-space:nowrap;">Writing Style:</label>
                    <select id="pp_writingStyle" style="width:120px;font-size:16px;">

                        <option value="Grammar">Grammar</option>
                        <option value="Grammar & Style">Grammar &amp; Style</option>
                    </select>
                </div>
                <button class="pp-btn" style="margin-top:6px;padding:3px 10px;font-size:16px;">
                    Recheck Document
                </button>
            </div>
            <div>
<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:15px;">
                <div class="pp-group-title" style="margin-top:0;">Exceptions for:</div>
                <select id="pp_exceptFor" style="width:100%;font-size:16px;margin-bottom:6px;">
                    <option value="All New Documents">All New Documents</option>
                </select>
                <div style="display:flex;flex-direction:column;gap:1px;">
<label style="display:flex;align-items:center;gap:8px;font-size:16px;">
                        <input type="checkbox" id="pp_hideSpellingOnly" >
                        Hide spelling errors in this document only
                    </label>
                    <label style="display:flex;align-items:center;gap:8px;font-size:16px;">
                        <input type="checkbox" id="pp_hideGrammarOnly" >
                        Hide grammar errors in this document only
                    </label>
                </div>
            </div>
        </div>
        <div class="pp-error" id="pp_err_spelling"></div>
        <div class="pp-btn-row">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
            <button class="pp-btn pp-btn-ok" onclick="checkSpellingGrammarPopup()">OK</button>
        </div>`;
    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});
}
function checkSpellingGrammarPopup(){
    _hidePopupError('pp_err_spelling');
    const a    = window._ppAns||{};
    const chkS = document.getElementById('pp_checkSpelling').checked;
    const mrkG = document.getElementById('pp_markGrammar').checked;
    const cfW  = document.getElementById('pp_confusedWords').checked;

    const chkG = document.getElementById('pp_checkGrammar').checked;
    const rdb  = document.getElementById('pp_readability').checked;
    const ws   = document.getElementById('pp_writingStyle').value;
    const hgO  = document.getElementById('pp_hideGrammarOnly').checked;
const hsO  = document.getElementById('pp_hideSpellingOnly').checked;
    let errors=[];
    if(a.checkSpelling   !==undefined&&chkS!==a.checkSpelling)    errors.push('CheckSpelling→'+a.checkSpelling);
    if(a.markGrammar     !==undefined&&mrkG!==a.markGrammar)      errors.push('MarkGrammar→'+a.markGrammar);
    if(a.confusedWords   !==undefined&&cfW !==a.confusedWords)    errors.push('ConfusedWords→'+a.confusedWords);
    if(a.checkGrammar    !==undefined&&chkG!==a.checkGrammar)     errors.push('CheckGrammar→'+a.checkGrammar);
    if(a.showReadability !==undefined&&rdb !==a.showReadability)  errors.push('Show readability statistics→'+a.showReadability);

    if(a.writingStyle    &&ws!==a.writingStyle)                    errors.push('Style→'+a.writingStyle);
if(    a.hideSpellingOnly !== undefined &&    hsO !== a.hideSpellingOnly)
{
    errors.push(        'HideSpelling→'+a.hideSpellingOnly    );
}
    if(a.hideGrammarOnly !==undefined&&hgO !==a.hideGrammarOnly)  errors.push('HideGrammar→'+a.hideGrammarOnly);
    if(errors.length){_showPopupError('pp_err_spelling','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   09. POPUP RIBBON ONLY — THIẾT KẾ MỚI (5 Ô CHỌN TUẦN TỰ)
Cấp này CÓ sub con bên dưới Dùng { } Cấp này KHÔNG có sub con (cấp cuối)Dùng [ ]
//copy Answer vào HTML, sửa mẫu theo Insert , 'Vertical Box List': ['A','B'], 
   ============================================================
popupType: 'ribbon-only',
popupAnswer: {
     	ribbonTab: 'tab_Insert',
     	ribbonCmd: 'Table',
     	ribbonSub: 'Insert Table',
     	ribbonSubSub: '',      
     	ribbonSubSubSub: ''  }},

     ribbonSubSubSub: '',     // để trống nếu không dùng tới ô này
   ============================================================
   GIAO DIỆN:
   - Dòng 1: "Bước đầu tiên" — hiện nội dung option đã chọn đúng ở Bước 1
   - Dòng 2: "Bước tiếp theo" — 5 ô dropdown xếp ngang:
       [Tab] [Nhóm lệnh] [Lệnh] [Mở rộng 1] [Mở rộng 2]
   - Ô sau bị KHÓA (disabled) cho đến khi ô trước chọn ĐÚNG
   - Ô nào không có dữ liệu (không cần dùng tới) sẽ tự ẩn
   - Nút "Hoàn thành" bấm để chấm điểm

   ============================================================
   HƯỚNG DẪN THAY ĐỔI DỮ LIỆU — xem chi tiết trong _RO_RIBBON dưới
============================================================ */

/* ── DỮ LIỆU RIBBON — chỉ dùng cho popup 09, KHÔNG đụng popup khác ──
   Cấu trúc: 'Tên Tab': { 'Tên Nhóm lệnh': [...cấp 3] }
   Nếu cấp 3 cần thêm cấp 4 → đổi mảng [] thành object { 'Tên cấp 3': [...cấp4] }
   Nếu cấp 4 cần thêm cấp 5 → đổi mảng [] thành object { 'Tên cấp 4': [...cấp5] }
   Ô nào không tồn tại trong dữ liệu sẽ TỰ ẨN trên giao diện.
//var _RO_RIBBON = { (luôn luôn bằng đáp án)
'tab_Home': {
    	'Bold': [],
    	'Underline': {
        		'ABC': [],
        		'MN': {
            			'123': [],
            			'456': ['xác nhận chèn']}  
		}//MN, Underline không còn nên không phẩy
	},
Có cấp con dùng { ; Không cấp con dùng ]
//2 câu hỏi cùng đường dẫn, ít cấp thì xóa hẳn cấp dư, cấp cuối không có phẩy 
============================================================ */
var _RO_RIBBON = {
'tab_File': {
    	'Option':{
        		'danh mục: General': ['Mark as Final'],
       		'danh mục: Display':{ 
			'mục: Always show these formatting ...': ['chọn Show all formatting marks', 'chọn tab Characters'] },
        		'danh mục: Proofing': {
			'mục: spelling and grammar': ['chọn Replace text as you type'] ,
			'mục: AutoCorrect Options': ['chọn Check spelling as you type'] ,
			'mục: Exceptions for': ['chọn hide spelling errors'] }
    		},
        	'Info':{
        		'mở rộng Properties': {
				'tab: Summary': ['mục Subject: nhập văn bản theo yêu cầu','mục Keywords: nhập văn bản theo yêu cầu'] },	
		'mở rộng Show All Properties': {
			'mục Status': ['nhập văn bản theo yêu cầu'],
			'mục Subject': ['nhập văn bản theo yêu cầu']},
        		'mở rộng Manage Document': [],	
		'mở rộng Protect Document': [],
		'mở rộng Check for Issues': {
			'mục kiểm tra: Inspect Document': ['chọn thông tin cần kiểm tra-kiểm tra-xóa'],
			'mục kiểm tra: Check Accessibility': ['chọn lỗi - sửa lỗi theo hướng dẫn'] } 
		},
	'Print': ['Settings']
	},

'tab_Home': {
	'mở rộng Paste': [],
    	'Copy': {
		'chọn vị trí cần paste':{
			'mở rộng Paste': ['kiểu dán: Keep text only'] }	},
    	'Cut': {
		'chọn vị trí cần paste': ['kết hợp với Insert Footnote','nháy chọn lệnh Paste'] },
	'Font': ['Bold', 'Italic', 'Underline', 'Strikethrough'] ,
	'mở rộng hộp thoại Font': {
		'thẻ Advanced': {
			'mục Spacing: Expanded': ['mục By: 2 pt'] }},
	'mở rộng icon Change case': ['kiểu: Sentence case', 'kiểu: lowercase', 'kiểu: UPPERCASE','kiểu: Capitalize Each Word'],
	'Căn văn bản: Center': [],
	'mởR Text Effects And Typography': {
		'hiệu ứng: Reflection': ['kiểu: theo yêu cầu'] },
        	'chọn icon Show/Hide Paragraph Mark': {
		'vị trí: sau ngắt phần': [],
		'vị trí: trước ngắt phần': ['nhấn phím Delete'] },
        	'mở rộng Styles văn bản': ['kiểu: Title', 'kiểu: Heading 2', 'kiểu: Heading 1', 'click phải kiểu: Heading 1', 'kiểu: Intense Emphasis', 'kiểu: Strong'],
        	'mở rộng Numbering':{
	      	'Set Numbering Value': ['danh sách: nhập theo yêu cầu'] ,
		'kiểu: A.B.C.': []},
        	'mở rộng Bullets':{
	      	'Define New bullet':{
			'mục Picture': ['tìm hình ảnh thay thế'] }},
	'icon Bullets: nháy chọn mặc định': ['do câu hỏi không có Bullets cụ thể'],
    	'mởR Line And Paragraph Spacing':{
			'khoảng cách: 2.0': [],
	      		'khoảng cách: Line Spacing Option':{
				'mục Line spacing: Multiple': ['mục At: nhập số'] }},
    	'mở rộng Find':{
	      	'Goto':{
	      		'danh sách: Heading':['ô Number: số tiêu đề'],
			'danh sách: Bookmark': ['ô tên: theo yêu cầu']},
	      	'Find':{
	      		'ô tìm kiếm: nhập văn bản':['mục Results: chọn văn bản tìm được'] }
		},
        	'Replace':  {
        		'ô Find what: văn bản tìm kiếm': {
        			'ô Replace with: văn bản thay thế': ['kiểu: Replace All'] }},
	'mở rộng Select': ['Select All'],
        	'mởR icon Text Highlight Color': ['màu: Dark Yellow', 'màu: Turquoise'] ,
        	'mở rộng hộp thoại Paragraph':{
			'tab: Line and Page Breaks': [],
			'tab: Indents and Spacing': {
	      			'mục Alignment': ['vị trí: Justified','vị trí: Center']}}
		},

'tab_Insert': {
        	'mở rộng Table': {
		'Insert Table': [],
		'Draw Table': [],	   
		'Convert Text to Table': {
			'Mục Table size: chọn số cột-dòng': ['Mục AutoFit-Separate thiết lập theo yêu cầu'],
			'Mục Table size: số cột-dòng mặc định': ['Mục AutoFit-Separate thiết lập theo yêu cầu'] }}, 	
	'Picture': {
		'Lưu trữ: theo yêu cầu': ['xác nhận chèn'] },
	'mở rộng Shapes': {
		'mục: Basic Shape': ['kiểu: Cube'],
		'mục: Stars and Banners': ['kiểu: Horizontal Scroll'] },	
        	'Hyperlink': {
		'mục: Place in This Document': {
			'tên liên kết: Contact': ['xác nhận liên kết'],
			'Remove Link': ['xác nhận xóa'] },
		'mục: E-mail Address': {
			'ô Address: nhập địa chỉ Email': ['ô Subject: nhập chủ đề'] }
		},
        	'mở rộng Object': {
		'kiểu chèn: Object': [],
		'kiểu chèn: Text from File': {
			'Lưu trữ: theo yêu cầu': ['xác nhận chèn'] }},
	'mở rộng Symbol': {  
		'More Symbols': {
			'tab Symbols': [],
			'tab: Special Characters': ['ký hiệu: theo yêu cầu'] }},
        	'mở rộng Drop Cap': {
		'kiểu: Dropped': [],
		'Drop Cap Options': {
			'vị trí: In margin': ['số dòng: theo yêu cầu'] }},
        	'mở rộng WordArt':  {
			'tên WordArt: Fill Black': ['kiểu WordArt: theo yêu cầu'] ,
			'tên WordArt Fill Gold': ['kiểu WordArt: theo yêu cầu'] ,
			'tên WordArt Fill White': ['kiểu WordArt: theo yêu cầu'] },
	'mở rộng Textbox': {
		'kiểu: Banded Quote': ['nhập văn bản theo yêu cầu'] },			
        	'mở rộng Cover Page': {
			'kiểu trang bìa: Facet': {
				'mục tiêu đề: Document Subtitle': ['xóa: nhấn phím Delete'] },
			'kiểu: Filigree': {
				'mục Document Subtitle: xóa': ['mục Title-Address: theo yêu cầu'] }
			},
	'mở rộng Footer': ['Edit Footer'],
	'mở rộng Header': {
		'kiểu: Slice 2': {
			'Thiết lập bỏ trang 1 - chọn Next': ['đóng Header & Footer'] },
		'kiểu: Banded': {
			'Thiết lập bỏ trang 1 - chọn Next': ['đóng Header & Footer'] }},
	'mở rộng Page Number': {
		'vị trí: Bottom of Page': ['kiểu: theo yêu cầu'],
		'vị trí: Top of Page': ['kiểu: theo yêu cầu'] },			
        	'Bookmark': {
		'ô Name: nhập tên cần thêm': ['xác nhận: Add'] },
        	'SmartArt': {
            		'thư viện: List': {
			'kiểu: Vertical Bullet List': [ ], 
			'kiểu: Picture Accent List': [ ],
			'kiểu: Vertical Box List': ['nhập văn bản theo yêu cầu'] },
		 'thư viện: Process': {
			'kiểu: Closed Chevron Process': ['nhập văn bản theo yêu cầu'],
			'kiểu: Step Up Process': ['nhập văn bản theo yêu cầu'] }
		}
},

'tab_Design': {
        	'mở rộng Themes': ['chủ đề: Office', 'chủ đề: Facet', 'chủ đề: Integral','chủ đề: Organic','chủ đề: Circuit'],
        	'mở rộng Paragraph Spacing': ['Tight', 'Custom Paragraph Spacing'],
        	'mở rộng Effects': ['tên hiệu ứng: Reflection','tên hiệu ứng: Office'],
        	'mở rộng Page Color': ['màu: No Color', 'màu: theo yêu cầu'],
        	'mở rộng Watermark': {
		'kiểu: dựng sẳn': [],
		'kiểu: Custum Watermark': {
				'mục Text watermark: bật check': ['thiết lập theo yêu cầu'] }},
	'Page Borders': {
		'thẻ Page Borders': {
			'mục Setting: dạng Box': ['mục khác: thiết lập theo yêu cầu'] }},				
        	'mở rộng More Document Formatting': ['kiểu: Shaded'],
	},

'tab_Layout': {
	'mở rộng hộp thoại Page Setup': {
            		'hộp thoại new: tab Margins': [],
            		'hộp thoại new: tab Paper': [],
            		'hộp thoại new: tab Layout': {
			'mục: Vertical alignment': ['vị trí: Center','vị trí: Top']}},
	'mở rộng hộp thoại Paragraph': {
            			'mục Alignment': ['Justified']},
            	'mở rộng Margins': ['kiểu lề: Custom Margins', 'kiểu lề: Narrow'],
	'mở rộng Orientation': ['hướng trang: Landscape','hướng trang: Portrait'],
	'mở rộng Size': ['khổ trang: theo yêu cầu'],
            	'mở rộng Columns':{
		'More columns': {
			'mục Number: chọn số cột': ['chọn Line between']}},
        	'mở rộng Breaks': {
		'mục: Section Breaks': ['kiểu ngắt: Next Page','kiểu ngắt: Odd Page'],
		'mục: Page Breaks': ['kiểu ngắt: Page', 'kiểu ngắt: Column', 'kiểu ngắt: Text Wrapping']}
	},

'tab_References': {
        	'mởR Table of Contents': ['kiểu: Automatic Table 1', 'kiểu: Manual Table'],
	'Update Table': {
		'kiểu: cập nhật toàn bộ': ['xác nhận cập nhật'],
		'kiểu: chỉ cập nhật 1 phần': ['xác nhận cập nhật'] },
        	'mở rộng Insert Citation': ['Add New Source'],
        	'mở rộng Style': ['APA'],
        	'mở rộng Bibliography': ['kiểu: Works Cited', 'kiểu: References'],
    	'Insert Table Of Figures':{
	      		'mục Tab leader: - - - (hyphen)': ['nhãn: Figure'] },
	'Insert Footnote': {
		'trở lại tab_Home': {
			'mở rộng Paste': ['kiểu dán: Keep text only']}},
        	'Insert Caption':{
		 'mục Caption: nhập văn bản': ['nhãn: Figure','nhãn: Table']},
        	'Manage Sources': {
        		'tên nguồn: theo yêu cầu': {
			'Thao tác chỉnh sửa: Edit': ['thông tin chỉnh sửa: theo yêu cầu'] }}
    	},

'tab_Mailings': {
        	'Start Mail Merge': ['Letters', 'Envelopes', 'Labels'],
        	'Write & Insert Fields': ['Address Block', 'Greeting Line']
	},
'tab_Review': {
        	'Proofing': {
		'Spelling & Grammar': ['Thesaurus', 'Word Count'] },
	'mở rộng Track Changes': ['Track Changes', 'Lock Tracking'],
	'mở rộng Show Markup': [] 
    	},
'tab_View': {
        	'Zoom': ['chọn % theo yêu cầu']
    	},


    /* ── 2 TAB TOOL — xuất hiện khi chọn bảng/hình, ở đây đặt cố định ── */
'Tools Table_Design': {	
        	'mở rộng more Table Styles': {
		'mục Plain Tables': ['kiểu Table: theo yêu cầu'],
		'mục List Tables': [],
		'mục Grid Tables': ['kiểu: chọn đúng yêu cầu'] },
      	'mở rộng Shading': ['Border Painter', 'Border Styles', 'Pen Color']
	},

'Tools Table_Layout': {
        	'Insert Above': [], 
	'Insert Below': [], 
	'mở rộng Delete': [] ,
        	'Merge Cells': [], 
	'Split Cells': [], 
	'Split Table': [],
        	'Distribute Columns':  [],
	'mở rộng hộp thoại Cell Size': {
			'tab: Alt Text': {
				'mục Title: nhập văn bản Tiêu đề': ['mục Description: nhập văn bản mô tả'] }},
        	'Convert to Text':  ['Thiết lập theo yêu cầu'],
	'Sort':  {
		'Mục Sort by: cột Time': {
			'Thứ tự: Ascending': ['chọn xác nhận'] },
              		'Mục Sort by: cột Column 1': {
                		'Thứ tự: Ascending': ['chọn xác nhận'] }
		},
	'Repeat Header Rows': ['Tiêu đề được lặp lại cho trang tiếp theo'],
	},


'Tools Picture': {	
        	'mở rộng hộp thoại Picture Styles': {
        		'Layout & Properties': {
        			'mục Alt Text': ['nhập tên tiêu đề - mô tả']}},
	'mở rộng Picture Effects': {
		'tên hiệu ứng: Bevel': ['hiệu ứng: theo yêu cầu'] },
	'Change Picture': {
		'lưu trữ: theo yêu cầu': ['chọn xác nhận thay đổi'] },
	'mở rộng Crop': {
		'mở rộng Crop to Shape': {
				'Mục: Starts and Banners': ['kiểu: theo yêu cầu'] }},
        	'Remove Background': {
        		'chọn Mark Areas to Keep': {
        			'chỉnh sửa: kéo 1 phần - kéo hết': ['chọn xác nhận: Keep Changes']}}
	},

'Tools Header & Footer': {	
        	'bỏ qua trang 1: Different First Page - Next': {
        		'chọn vị trí - chèn Date & Time': {
        			'chọn Update automatically': ['kiểu: Date & Time - xác nhận'] }},
	'mở rộng Page Number': {
		'Format Page Numbers': ['mục Start at: số trang cần đặt lại'] }		
		},
'Tools Smartart_Layout': {
	'Change Colors': {
			'tên màu: Colorfull': ['kiểu màu: theo yêu yêu cầu'],
			'tên màu: Accent 1': ['kiểu màu: theo yêu yêu cầu'], 
			'tên màu: Accent 1': ['kiểu màu: theo yêu yêu cầu'] }},
'Tools Smartart_Format': [],
'Tools Drawing': {	
        	'bỏ qua trang 1: Different First Page - Next': {
        		'chọn vị trí - chèn Date & Time': {
        			'chọn Update automatically': ['kiểu: Date & Time - xác nhận']}},
	'mở rộng Position': {
		'mục: With Text Wrapping': ['kiểu: ở chính giữa cuối trang'] }
	}
};

var _RO_TAB_NAMES = [
    'tab_File','tab_Home','tab_Insert','tab_Design','tab_Layout','tab_References','tab_Mailings','tab_Review','tab_View',
    'Tools Table_Design','Tools Table_Layout','Tools Picture','Tools Header & Footer','Tools Drawing','Tools Smartart_Layout','Tools Smartart_Format'
		];

var _RO_GROUP_DISPLAY = {
'tab_Home': {
        'nhóm Clipboard': ['mở rộng nhóm Clipboard', 'Copy','mở rộng Paste','Cut'],
        'nhóm Font':      ['Font','mở rộng hộp thoại Font','mở rộng icon Change case','mởR icon Text Highlight Color','mởR Text Effects And Typography','icon Clear All Formatting'],
        'nhóm Paragraph': ['Căn văn bản: Center','chọn icon Show/Hide Paragraph Mark', 'mở rộng Numbering', 'mở rộng Bullets','icon Bullets: nháy chọn mặc định','mởR Line And Paragraph Spacing','mở rộng hộp thoại Paragraph'],
        'nhóm Styles':    ['mở rộng Styles văn bản'],
        'nhóm Editing':   ['mở rộng Find', 'Replace', 'mở rộng Select']
    	},
'tab_Insert': {
        'nhóm Pages':    ['mở rộng Cover Page'],
        'nhóm Tables':   ['mở rộng Table'],
        'nhóm Illustrations': ['SmartArt','Picture','mở rộng Shapes'],
        'nhóm Links':    ['Hyperlink', 'Bookmark'],
        'nhóm Text':     ['mở rộng Object', 'mở rộng Drop Cap','mở rộng Textbox','mở rộng WordArt'],
        'nhóm Symbols':     ['mở rộng Symbol'],
        'nhóm Header & Footer': ['mở rộng Footer','mở rộng Header','mở rộng Page Number']
    	},
'tab_Design': {
        'nhóm Document Formatting': ['mở rộng Themes', 'mở rộng More Document Formatting','mở rộng Effects','mở rộng Paragraph Spacing'],
        'nhóm Page Background': ['mở rộng Page Color','mở rộng Watermark','Page Borders']
    	},
'tab_Layout': {
        'nhóm Page Setup': ['mở rộng hộp thoại Page Setup','mở rộng Columns','mở rộng Breaks','mở rộng Margins','mở rộng Orientation','mở rộng Size'],
        'nhóm Paragraph':  ['mở rộng hộp thoại Paragraph','Indent','Spacing'],
        'nhóm Arrange':    ['mở rộng Align']
    	},
'tab_References': {
        'nhóm Table of Contents': ['mởR Table of Contents','Update Table'],
        'nhóm Footnotes': ['Insert Footnote','Insert Endnote'],
        'nhóm Citations & Bibliography': ['mở rộng Bibliography','Manage Sources','mở rộng Style','mở rộng Insert Citation'],
        'nhóm Captions':  ['Insert Caption', 'Insert Table Of Figures'],
        'nhóm Index & Table of Authorities':    ['Insert Index']
    	},
'tab_Mailings': {
        'nhóm Start Mail Merge': ['Start Mail Merge'],
        'nhóm Write & Insert Fields': ['Write & Insert Fields'],
        'nhóm Create': [],
        'nhóm Preview Results': [],
        'nhóm Finish': []
    	},
'tab_Review': {
        'nhóm Proofing':  ['Spelling & Grammar'],
        'nhóm Tracking':  ['mở rộng Track Changes'],
        'nhóm Change':    [],
        'nhóm Compare':    [],
        'nhóm Project':    []
    	},
'tab_View': {
        'nhóm Views': [],
        'nhóm Show': [],
        'nhóm Zoom':   ['Zoom'],
        'nhóm Window': [],
        'nhóm Macros': []
    	},
'tab_File': {
        'Info':     ['mở rộng Show All Properties','mở rộng Properties','mở rộng Check for Issues','mở rộng Manage Document','mở rộng Protect Document'],
        'Print': ['Settings'],
        'Option': ['Danh sách: General','Danh sách: Display','Danh sách: Proofing'],
        'Export':   [],
        'Share':   []
    	},
'Tools Picture': {
        'nhóm Adjust': ['Remove Background','Change Picture'],
        'nhóm Picture Styles': ['mở rộng hộp thoại Picture Styles','mở rộng Picture Effects'],
        'nhóm Arrange': [],
        'nhóm Size': ['mở rộng Crop']
    	},
'Tools Header & Footer': {
        'nhóm Insert': ['bỏ qua trang 1: Different First Page - Next','mở rộng Page Number'] },
'Tools Table_Design': {
        'nhóm Table Styles': ['mở rộng more Table Styles', 'mở rộng Shading'],
        'Table Styles': [],
        'nhóm Borders':  ['Borders'] },
'Tools Table_Layout': {
        'nhóm Table & Draw': [],
        'nhóm Rows & Columns': ['Rows & Columns','mở rộng Delete'],
        'nhóm Merge': ['Merge Cells','Split Cells','Split Table'],
        'nhóm Cell Size': ['mở rộng hộp thoại Cell Size','Merge','Distribute Columns'],
        'nhóm Alignment ': [],
        'nhóm Data':           ['Sort','Convert to Text','Repeat Header Rows'] },
'Tools Smartart_Format': {
	'nhóm Shape Style': [],
		},
'Tools Smartart_Layout': {
	'nhóm Smartart Style': ['Change Colors'],
		},
'Tools Drawing': {
        'nhóm Insert Shapes':  [],
        'nhóm Shape Styles': [],
        'nhóm WordArt Styles': [],
        'nhóm Text': [],
        'nhóm Arrange': ['mở rộng Position','Align','Wrap Text'],
        'nhóm Size': [] }

};

/* ============================================================
   HÀM CHÍNH — MỞ POPUP
============================================================ */
function openRibbonOnlyPopup(step){
    var box = _createPopupShell('Microsoft Word — Chọn đường dẫn lệnh');
    var ans = step.popupAnswer || {};

    var ansTab    = ans.ribbonTab        || '';
    var ansCmd    = ans.ribbonCmd        || '';
    var ansSub    = ans.ribbonSub        || '';
    var ansSub2   = ans.ribbonSubSub     || '';
    var ansSub3   = ans.ribbonSubSubSub  || '';

    window._roAns = { tab:ansTab, cmd:ansCmd, sub:ansSub, sub2:ansSub2, sub3:ansSub3 };
    window._roSelected = { tab:'', cmd:'', sub:'', sub2:'', sub3:'' };

    /* Lấy nội dung "Bước đầu tiên" — option đã chọn đúng ở Bước 1 */
    var step1Text = '';
    try{
        var sel = document.getElementById('step1Select');
        if(sel && sel.selectedIndex >= 0){
            step1Text = sel.options[sel.selectedIndex].text;
        }
    }catch(e){}

    var body = document.createElement('div');
    body.className = 'mos-popup-body';
body.style.cssText = 'width:100%;gap:0;padding:0;font-family:Arial,sans-serif;';
    /* ── Dòng 1: Bước đầu tiên ── */
    var step1Box = document.createElement('div');
    step1Box.style.cssText = 'padding:10px 14px;background:#eff6ff;'
        +'border-bottom:1px solid #bfdbfe;font-size:14px;color:#1e3a5f;';
    step1Box.innerHTML = '<b>Bước đầu tiên:</b> '+(step1Text || '(chưa chọn ở Bước 1)');
    body.appendChild(step1Box);

    /* ── Dòng 2: Bước tiếp theo — tiêu đề ── */
    var step2Title = document.createElement('div');
    step2Title.style.cssText = 'padding:10px 14px 4px;font-size:14px;font-weight:bold;color:#1e3a5f;';
    step2Title.textContent = 'Bước tiếp theo — chọn đúng đường dẫn lệnh:';
    body.appendChild(step2Title);

    /* ── Dòng trên: Tab + Nhóm lệnh ── */
    var tabRow = document.createElement('div');
    tabRow.id = 'pp_ro_tabRow';
    tabRow.style.cssText = 'display:flex;gap:16px;padding:10px 14px 6px;';
    body.appendChild(tabRow);

    /* ── Dòng dưới: Lệnh | Mở rộng 1 | Mở rộng 2 — trải đều ── */
    var row = document.createElement('div');
    row.id = 'pp_ro_row';
    row.style.cssText = 'display:flex;gap:16px;padding:6px 14px 14px;position:relative;';
    body.appendChild(row);

    var labels = ['Tab','Nhóm lệnh','Lệnh','Mở rộng 1','Mở rộng 2'];

/* ── Ô 1: Tab — đặt vào tabRow, flex:1 ── */
    var col1 = document.createElement('div');
    col1.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:1 1 0;min-width:0;';
    var lbl1 = document.createElement('label');
    lbl1.style.cssText = 'font-size:14px;color:#64748b;font-weight:bold;';
    lbl1.textContent = labels[0];
    var d1 = document.createElement('select');
    d1.id = 'pp_ro_d1';
    d1.style.cssText = 'padding:8px 8px;border:1px solid #94a3b8;border-radius:4px;font-size:14px;background:#fff;width:100%;';
    d1.innerHTML = '<option value="">-- Chọn --</option>';
    _RO_TAB_NAMES.forEach(function(t){
        var o = document.createElement('option');
        o.value = t; o.textContent = t;
        d1.appendChild(o);
    });
    col1.appendChild(lbl1);
    col1.appendChild(d1);
    tabRow.appendChild(col1);

    /* ── Ô 2: Nhóm lệnh — đặt vào tabRow, flex:2 (rộng hơn Tab) ── */
    var col2 = document.createElement('div');
    col2.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:2 1 0;min-width:0;position:relative;';
    var lbl2 = document.createElement('label');
    lbl2.style.cssText = 'font-size:14px;color:#64748b;font-weight:bold;';
    lbl2.textContent = labels[1];

    /* "Mũi tên ngoài" — nút giả lập giống select, click để mở/đóng khung */
    var d2Btn = document.createElement('button');
    d2Btn.id = 'pp_ro_d2_btn';
    d2Btn.type = 'button';
    d2Btn.disabled = true;
    d2Btn.style.cssText = 'padding:8px 8px;border:1px solid #94a3b8;border-radius:4px;'
        +'font-size:14px;background:#f1f5f9;text-align:left;cursor:not-allowed;'
        +'display:flex;justify-content:space-between;align-items:center;color:#374151;';
    d2Btn.innerHTML = '<span id="pp_ro_d2_text">-- Chọn --</span><span style="font-size:11px;">▼</span>';

    /* Khung accordion thả xuống — ẩn ban đầu */
    var d2Panel = document.createElement('div');
    d2Panel.id = 'pp_ro_d2_panel';
d2Panel.style.cssText = 'display:none;position:absolute;top:100%;left:0;width:280px;'
    +'background:#fff;border:1px solid #94a3b8;border-radius:4px;'
    +'box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:50;margin-top:2px;'
    +'max-height:260px;overflow-y:auto;';

    col2.appendChild(lbl2);
    col2.appendChild(d2Btn);
    col2.appendChild(d2Panel);

    var d2Simple = document.createElement('select');
    d2Simple.id = 'pp_ro_d2_simple';
    d2Simple.style.cssText = 'display:none;padding:8px 8px;border:1px solid #94a3b8;'
        +'border-radius:4px;font-size:14px;background:#fff;width:100%;';
    d2Simple.innerHTML = '<option value="">-- Chọn --</option>';
    d2Simple.addEventListener('change', function(){ _roOnSelectGroupItem(d2Simple.value); });
    col2.appendChild(d2Simple);

    tabRow.appendChild(col2);   /* ← Ô 2 nằm cùng dòng với Tab (tabRow) */

    d2Btn.addEventListener('click', function(e){
        e.stopPropagation();
        if(d2Btn.disabled){ return; }
        var isOpen = d2Panel.style.display === 'block';
        d2Panel.style.display = isOpen ? 'none' : 'block';
    });
    document.addEventListener('click', function(e){
        if(d2Panel && !d2Panel.contains(e.target) && e.target !== d2Btn && !d2Btn.contains(e.target)){
            d2Panel.style.display = 'none';
        }
    });

    /* ── Ô 3, 4, 5: select chuẩn — đặt vào row (dòng dưới), trải đều ── */
    var ids345 = ['pp_ro_d3','pp_ro_d4','pp_ro_d5'];
    ids345.forEach(function(id, idx){
        var col = document.createElement('div');
        col.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:1 1 0;min-width:0;';
        var lbl = document.createElement('label');
        lbl.style.cssText = 'font-size:14px;color:#64748b;font-weight:bold;';
        lbl.textContent = labels[idx+2];
        var sel = document.createElement('select');
        sel.id = id;
        sel.disabled = true;
        sel.style.cssText = 'padding:8px 8px;border:1px solid #94a3b8;border-radius:4px;'
            +'font-size:14px;background:#f1f5f9;width:100%;';
        sel.innerHTML = '<option value="">-- Chọn --</option>';
        col.appendChild(lbl);
        col.appendChild(sel);
        row.appendChild(col);
    });

    /* ── Gắn event cho Tab và các ô 3,4,5 ── */
    d1.addEventListener('change', function(){ _roOnSelectTab(d1.value); });
    row.querySelector('#pp_ro_d3').addEventListener('change', function(e){ _roOnSelect(3, e.target.value); });
    row.querySelector('#pp_ro_d4').addEventListener('change', function(e){ _roOnSelect(4, e.target.value); });
    row.querySelector('#pp_ro_d5').addEventListener('change', function(e){ _roOnSelect(5, e.target.value); });

    /* Error */
    var errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_ribbononly';
    errDiv.style.margin = '0 14px 10px';
    body.appendChild(errDiv);

    /* Nút Hoàn thành + Cancel */
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:16px;padding:10px 14px;'
        +'border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>'
        +'<button class="pp-btn pp-btn-ok" onclick="_roCheckFinal()">✔ Hoàn thành</button>';
    body.appendChild(btnRow);

    body.querySelectorAll('label,select,button,div,span').forEach(function(el){
        el.style.fontSize = '14px';
    });
box.style.width = '98%';
    box.appendChild(body);
    setTimeout(function(){
        var overlay = box.closest('.mos-popup-overlay');
        if(overlay){
            overlay.style.alignItems = 'flex-start';
            overlay.style.overflowY  = 'auto';
            overlay.style.paddingTop = '10px';
        }
    }, 0);
}

/* ============================================================
   XỬ LÝ KHI CHỌN TAB (Ô 1) — dựng lại khung accordion của Ô 2
============================================================ */
function _roOnSelectTab(value){
    _hidePopupError('pp_err_ribbononly');
    var a = window._roAns;
    var s = window._roSelected;
    s.tab = value; s.cmd = ''; s.sub = ''; s.sub2 = ''; s.sub3 = '';

    /* Khóa lại ô 3,4,5 */
    ['pp_ro_d3','pp_ro_d4','pp_ro_d5'].forEach(function(id){
        var el = document.getElementById(id);
        if(el){ el.disabled = true; el.style.background = '#f1f5f9'; el.innerHTML = '<option value="">-- Chọn --</option>'; }
    });

    var d2Btn    = document.getElementById('pp_ro_d2_btn');
    var d2Text   = document.getElementById('pp_ro_d2_text');
    var d2Panel  = document.getElementById('pp_ro_d2_panel');
    var d2Simple = document.getElementById('pp_ro_d2_simple');
    d2Panel.innerHTML = '';
    d2Panel.style.display = 'none';
    d2Text.textContent = '-- Chọn --';
    d2Simple.innerHTML = '<option value="">-- Chọn --</option>';
    d2Simple.value = '';

    if(!value){
        d2Btn.style.display = 'flex';
        d2Simple.style.display = 'none';
        d2Btn.disabled = true;
        d2Btn.style.background = '#f1f5f9';
        d2Btn.style.cursor = 'not-allowed';
        return;
    }

    /* Tab sai -> báo lỗi, KHÔNG mở khóa Ô 2 */
    if(a.tab && value !== a.tab){
        d2Btn.style.display = 'flex';
        d2Simple.style.display = 'none';
        d2Btn.disabled = true;
        d2Btn.style.background = '#f1f5f9';
        d2Btn.style.cursor = 'not-allowed';
        _showPopupError('pp_err_ribbononly', '❌ Sai! Ô "Tab" yêu cầu: <b>'+a.tab+'</b>');
        return;
    }

    /* ── Riêng Tab "File": dùng dropdown ĐƠN GIẢN, KHÔNG dùng accordion ── */
    if(value === 'tab_File'){
        d2Btn.style.display = 'none';
        d2Btn.disabled = true;
        d2Simple.style.display = 'block';
        d2Simple.disabled = false;
        d2Simple.style.background = '#fff';

        var fileCmds = Object.keys(_RO_RIBBON['tab_File'] || {});
        fileCmds.forEach(function(cmdName){
            var o = document.createElement('option');
            o.value = cmdName; o.textContent = cmdName;
            d2Simple.appendChild(o);
        });
        return;
    }

    /* ── Tab khác: giữ nguyên cơ chế accordion cũ, không đổi ── */
    d2Simple.style.display = 'none';
    d2Simple.disabled = true;
    d2Btn.style.display = 'flex';
    d2Btn.disabled = false;
    d2Btn.style.background = '#fff';
    d2Btn.style.cursor = 'pointer';

    var groups = _RO_GROUP_DISPLAY[value] || {};
    Object.keys(groups).forEach(function(groupName){
        var groupRow = document.createElement('div');
        groupRow.className = 'pp-ro-group-row';
        groupRow.style.cssText = 'border-bottom:1px solid #f1f5f9;';

        var groupHead = document.createElement('div');
        groupHead.className = 'pp-ro-group-head';
        groupHead.style.cssText = 'display:flex;justify-content:space-between;align-items:center;'
            +'padding:7px 12px;cursor:pointer;font-weight:bold;color:#1e3a5f;background:#f8fafc;';
        groupHead.innerHTML = '<span>'+groupName+'</span><span class="pp-ro-group-arrow" style="font-size:10px;">▼</span>';

        var groupBody = document.createElement('div');
        groupBody.className = 'pp-ro-group-body';
        groupBody.style.cssText = 'display:none;flex-direction:column;';

        (groups[groupName]||[]).forEach(function(cmdName){
            var item = document.createElement('div');
            item.className = 'pp-ro-cmd-item';
            item.style.cssText = 'padding:7px 20px;cursor:pointer;color:#374151;'
                +'border-top:1px solid #f1f5f9;';
            item.textContent = cmdName;
            item.addEventListener('mouseenter', function(){ item.style.background = '#eff6ff'; });
            item.addEventListener('mouseleave', function(){ item.style.background = ''; });
            item.addEventListener('click', function(e){
                e.stopPropagation();
                _roOnSelectGroupItem(cmdName);
            });
            groupBody.appendChild(item);
        });

        groupHead.addEventListener('click', function(e){
            e.stopPropagation();
            var arrow   = groupHead.querySelector('.pp-ro-group-arrow');
            var willOpen = groupBody.style.display === 'none';

            /* Đóng TẤT CẢ nhóm khác trước (accordion độc quyền) */
            d2Panel.querySelectorAll('.pp-ro-group-body').forEach(function(gb){
                gb.style.display = 'none';
            });
            d2Panel.querySelectorAll('.pp-ro-group-arrow').forEach(function(ar){
                ar.textContent = '▼';
            });

            /* Mở nhóm hiện tại nếu trước đó đang đóng */
            if(willOpen){
                groupBody.style.display = 'flex';
                arrow.textContent = '▲';
            }
        });

        groupRow.appendChild(groupHead);
        groupRow.appendChild(groupBody);
        d2Panel.appendChild(groupRow);
    });
}

/* ============================================================
   XỬ LÝ KHI CLICK 1 LỆNH CỤ THỂ TRONG KHUNG ACCORDION (Ô 2)
============================================================ */
function _roOnSelectGroupItem(value){
    var d2Text = document.getElementById('pp_ro_d2_text');
    var d2Panel= document.getElementById('pp_ro_d2_panel');
    d2Text.textContent = value;
    d2Panel.style.display = 'none';
    /* Gọi logic kiểm tra đúng/sai CŨ — không đổi gì */
    _roOnSelect(2, value);
}

/* ============================================================
   XỬ LÝ Ô 3, 4, 5 — GIỮ NGUYÊN LOGIC CŨ, KHÔNG ĐỔI
============================================================ */
function _roOnSelect(level, value){
    _hidePopupError('pp_err_ribbononly');
    var a = window._roAns;
    var s = window._roSelected;

    var ansKeys = ['tab','cmd','sub','sub2','sub3'];
    var key = ansKeys[level-1];
    var ansVal = a[key];

    s[key] = value;

    /* Khóa lại toàn bộ ô sau level hiện tại trước khi kiểm tra (chỉ áp dụng ô 3,4,5) */
    for(var i=Math.max(level+1,3); i<=5; i++){
        var elNext = document.getElementById('pp_ro_d'+i);
        if(elNext){
            elNext.disabled = true;
            elNext.style.background = '#f1f5f9';
            elNext.innerHTML = '<option value="">-- Chọn --</option>';
        }
    }

    if(!ansVal){
        if(value){
            _showPopupError('pp_err_ribbononly', '❌ Ô này không cần chọn ở câu hỏi này.');
        }
        return;
    }

    if(value !== ansVal){
        _showPopupError('pp_err_ribbononly',
            '❌ Sai! Ô "'+['Tab','Nhóm lệnh','Lệnh','Mở rộng 1','Mở rộng 2'][level-1]+'" yêu cầu: <b>'+ansVal+'</b>');
        return;
    }

    _roPopulateNext(level, value);
}

/* ── Đổ dữ liệu cho ô tiếp theo dựa trên _RO_RIBBON (GIỮ NGUYÊN LOGIC CŨ) ── */
function _roPopulateNext(level, value){
    var data = _roGetDataAtLevel(level, value);
    var nextEl = document.getElementById('pp_ro_d'+(level+1));
    if(!nextEl){ return; }

    if(!data){
        return;
    }

    var keys = Array.isArray(data) ? data : Object.keys(data);
    nextEl.innerHTML = '<option value="">-- Chọn --</option>';
    keys.forEach(function(k){
        var o = document.createElement('option');
        o.value = k; o.textContent = k;
        nextEl.appendChild(o);
    });
    nextEl.disabled = false;
    nextEl.style.background = '#fff';
}

/* ── Lấy dữ liệu con tại 1 cấp — GIỮ NGUYÊN LOGIC CŨ, KHÔNG ĐỔI ── */
function _roGetDataAtLevel(level, value){
    var s = window._roSelected;
    if(level === 1){
        return _RO_RIBBON[value] || null;
    }
    if(level === 2){
        var tabData = _RO_RIBBON[s.tab] || {};
        return tabData[value] !== undefined ? tabData[value] : null;
    }
    if(level === 3){
        var cmdData = (_RO_RIBBON[s.tab]||{})[s.cmd];
        if(!cmdData || Array.isArray(cmdData)){ return null; }
        return cmdData[value] !== undefined ? cmdData[value] : null;
    }
    if(level === 4){
        var subData = ((_RO_RIBBON[s.tab]||{})[s.cmd]||{})[s.sub];
        if(!subData || Array.isArray(subData)){ return null; }
        return subData[value] !== undefined ? subData[value] : null;
    }
    return null;
}

/* ============================================================
   KIỂM TRA TỔNG KHI BẤM "HOÀN THÀNH" — GIỮ NGUYÊN LOGIC CŨ
============================================================ */
function _roCheckFinal(){
    _hidePopupError('pp_err_ribbononly');
    var a = window._roAns;
    var s = window._roSelected;

    var ansKeys   = ['tab','cmd','sub','sub2','sub3'];
    var labelKeys = ['Tab','Nhóm lệnh','Lệnh','Mở rộng 1','Mở rộng 2'];
    var errors = [];

    ansKeys.forEach(function(key, idx){
        var ansVal = a[key];
        if(!ansVal){ return; }
        var selVal = s[key];
        if(selVal !== ansVal){
            errors.push(labelKeys[idx]+' → chưa đúng');
        }
    });

    if(errors.length){
        _showPopupError('pp_err_ribbononly', '❌ Chưa hoàn thành đúng: '+errors.join(' | '));
        return;
    }

    closeMosPopup();
    checkCorrect();
}

/* ============================================================
   10. POPUP SHOW DOCUMENT CONTENT (trùng 35 đã xóa
   ============================================================

/* ============================================================
   11. POPUP FIND AND REPLACE + FORMAT FONT (//copy vào HTML, font dưới cuộn quyết định popup) 
popupType:   'find-replace',
popupAnswer: {
    	findWhat:      'Mondays',
    	replaceWith:   'Fridays',
    	btnReplaceAll: true,
    	fontArial:     false,
    	size:          14,
	matchCase:  true }},

popupType:   'find-replace',    
popupAnswer: {
          tabReplace: true,   
       findWhat:    'rootball',   
       replaceWith: 'Amazon',     
       btnReplace:    false,
       btnReplaceAll: true,
       btnFindNext:   false }},
   ============================================================
popupType:   'find-replace',    
popupAnswer: {
       // Tab active
       tabReplace: true,   // mặc định mở tab Replace
 
       // Replace fields
       findWhat:    'rootball',   // text cần tìm
       replaceWith: 'Amazon',     // text thay thế
 
       // Nút bấm — chỉ 1 cái true
       btnReplace:    false,
       btnReplaceAll: true,
       btnFindNext:   false,
 
       // Search Options (More >>)
       searchAll:     true,  searchDown: false, searchUp: false,
       matchCase:          false,
       findWholeWords:     false,
       useWildcards:       false,
       soundsLike:         false,
       findAllWordForms:   false,
       matchPrefix:        false,
       matchSuffix:        false,
       ignorePunctuation:  false,
       ignoreWhiteSpace:   false,
 
       // Format → Font
       fontArial: true, fontCalibri: false, fontTimesNewRoman: false,
       fontStyleRegular: true, fontStyleItalic: false,
       fontStyleBold: false, fontStyleBoldItalic: false, fontStyleNotBold: false,
       size: 12,
       fontColorBlue: false, fontColorRed: false, fontColorBlack: false,
       underlineStyleSingle: false, underlineStyleDouble: false, underlineStyleNone: false,
       underlineColorBlue: false, underlineColorRed: false, underlineColorAutomatic: false,
       // Effects
       strikethrough:       false,
       doubleStrikethrough: false,
       superscript:         false,
       subscript:           false,
       smallCaps:           false,
       allCaps:             false,
       hidden:              false,
   }
============================================================ */
function openFindReplacePopup(step){
    const box = _createPopupShell('Find and Replace');
    const ans = step.popupAnswer || {};
 
    /* ── Giải mã true/false → giá trị chuỗi ── */
    const ansSearch      = ans.searchDown ? 'Down' : ans.searchUp ? 'Up' : 'All';
    const ansFont        = ans.fontArial           ? 'Arial'
                         : ans.fontCalibri         ? 'Calibri'
                         : ans.fontTimesNewRoman   ? 'Times New Roman' : '';
    const ansFontStyle   = ans.fontStyleRegular    ? 'Regular'
                         : ans.fontStyleItalic     ? 'Italic'
                         : ans.fontStyleBold       ? 'Bold'
                         : ans.fontStyleBoldItalic ? 'Bold Italic'
                         : ans.fontStyleNotBold    ? 'Not Bold' : '';
    const ansFontColor   = ans.fontColorBlue  ? 'Blue, Accent 1'
                         : ans.fontColorRed   ? 'Red'
                         : ans.fontColorBlack ? 'Black, Text 1' : '';
    const ansUnderline   = ans.underlineStyleSingle ? 'Single'
                         : ans.underlineStyleDouble ? 'Double'
                         : ans.underlineStyleNone   ? 'None' : '';
    const ansUnderClr    = ans.underlineColorBlue      ? 'Blue, Accent 1'
                         : ans.underlineColorRed       ? 'Red'
                         : ans.underlineColorAutomatic ? 'Automatic' : '';
    const ansBtn         = ans.btnReplaceAll ? 'ReplaceAll'
                         : ans.btnReplace    ? 'Replace'
                         : ans.btnFindNext   ? 'FindNext' : '';
 
    window._ppAns = {
        findWhat:           ('findWhat'    in ans) ? ans.findWhat    : undefined,
        replaceWith:        ('replaceWith' in ans) ? ans.replaceWith : undefined,
        action:             ansBtn,
        search:             ansSearch,
        matchCase:          ('matchCase'         in ans) ? ans.matchCase         : undefined,
        findWholeWords:     ('findWholeWords'     in ans) ? ans.findWholeWords    : undefined,
        useWildcards:       ('useWildcards'       in ans) ? ans.useWildcards      : undefined,
        soundsLike:         ('soundsLike'         in ans) ? ans.soundsLike        : undefined,
        findAllWordForms:   ('findAllWordForms'   in ans) ? ans.findAllWordForms  : undefined,
        matchPrefix:        ('matchPrefix'        in ans) ? ans.matchPrefix       : undefined,
        matchSuffix:        ('matchSuffix'        in ans) ? ans.matchSuffix       : undefined,
        ignorePunctuation:  ('ignorePunctuation'  in ans) ? ans.ignorePunctuation : undefined,
        ignoreWhiteSpace:   ('ignoreWhiteSpace'   in ans) ? ans.ignoreWhiteSpace  : undefined,
        font:               ansFont,
        fontStyle:          ansFontStyle,
        size:               ('size' in ans) ? ans.size : undefined,
        fontColor:          ansFontColor,
        underlineStyle:     ansUnderline,
        underlineColor:     ansUnderClr,
        strikethrough:      ('strikethrough'       in ans) ? ans.strikethrough       : undefined,
        doubleStrikethrough:('doubleStrikethrough' in ans) ? ans.doubleStrikethrough : undefined,
        superscript:        ('superscript'         in ans) ? ans.superscript         : undefined,
        subscript:          ('subscript'           in ans) ? ans.subscript           : undefined,
        smallCaps:          ('smallCaps'           in ans) ? ans.smallCaps           : undefined,
        allCaps:            ('allCaps'             in ans) ? ans.allCaps             : undefined,
        hidden:             ('hidden'              in ans) ? ans.hidden              : undefined,
    };
 
    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'padding:10px;min-width:640px;max-width:96%;';
    body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;">
 
      <!-- ===== CỘT TRÁI: Find & Replace ===== -->
      <div style="border:1px solid var(--pp-border,#94a3b8);border-radius:4px;overflow:hidden;">
 
        <!-- Tab bar -->
        <div style="display:flex;border-bottom:1px solid #cbd5e1;background:#f1f5f9;">
          <button style="padding:5px 14px;font-size:14px;border:none;border-bottom:2px solid transparent;background:none;cursor:pointer;color:#64748b;"
            onclick="pp_setTab('Find',this)">Find</button>
          <button id="pp_tabReplace" style="padding:5px 14px;font-size:12px;border:none;border-bottom:2px solid #2563eb;background:none;cursor:pointer;font-weight:bold;color:#2563eb;"
            onclick="pp_setTab('Replace',this)">Replace</button>
          <button style="padding:5px 14px;font-size:14px;border:none;border-bottom:2px solid transparent;background:none;cursor:pointer;color:#64748b;"
            onclick="pp_setTab('GoTo',this)">Go To</button>
        </div>
 
        <!-- Body Replace tab -->
        <div style="padding:10px;display:flex;flex-direction:column;gap:1px;">
          <div style="display:grid;grid-template-columns:auto 1fr;gap:1px;align-items:center;">
            <label style="font-size:14px;white-space:nowrap;">Find what:</label>
            <input type="text" id="pp_findWhat" value="" placeholder="Nhập từ cần tìm..." style="padding:4px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:16px;">
            <label style="font-size:14px;white-space:nowrap;">Replace with:</label>
            <input type="text" id="pp_replaceWith" value="" placeholder="Nhập từ thay thế..." style="padding:4px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:16px;">
          </div>
 
          <!-- Nút More / Search Options -->
          <div>
            <button class="pp-btn" id="pp_moreBtn" onclick="pp_toggleMore()"
              style="font-size:14px;padding:3px 12px;">More &gt;&gt;</button>
          </div>
 
          <!-- Search Options (ẩn mặc định) -->
          <div id="pp_moreSection" style="display:none;border:1px solid #e2e8f0;border-radius:4px;padding:8px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <label style="font-size:14px;">Search:</label>
              <select id="pp_search" style="width:80px;font-size:14px;padding:2px 4px;">
                <option value="All">All</option>
                <option value="Down">Down</option>
                <option value="Up">Up</option>
              </select>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 14px;">
              <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_matchCase"> Match case</label>
              <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_matchPrefix"> Match prefix</label>
              <label style="display:flex;align-items:center;gap:5px;font-size:14px;color:#94a3b8;"><input type="checkbox" id="pp_findWholeWords" disabled> Find whole words only</label>
              <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_matchSuffix"> Match suffix</label>
              <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_useWildcards"> Use wildcards</label>
              <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_ignorePunct"> Ignore punctuation characters</label>
              <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_soundsLike"> Sounds like (English)</label>
              <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_ignoreWhite"> Ignore white-space characters</label>
              <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_findAllWordForms"> Find all word forms (English)</label>
            </div>
          </div>
 
          <!-- Hàng nút Replace / Find Next / Cancel -->
          <div style="display:flex;gap:2px;justify-content:flex-end;margin-top:2px;flex-wrap:wrap;">
            <button class="pp-btn" onclick="pp_doAction('Replace')" style="font-size:14px;">Replace</button>
            <button class="pp-btn pp-btn-ok" onclick="pp_doAction('ReplaceAll')" style="font-size:14px;">Replace All</button>
            <button class="pp-btn" onclick="pp_doAction('FindNext')" style="font-size:14px;">Find Next</button>
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()" style="font-size:14px;">Cancel</button>
          </div>
 
          <div class="pp-error" id="pp_err_findreplace"></div>
        </div>
      </div>
 
      <!-- ===== CỘT PHẢI: Format → Font ===== -->
      <div style="border:1px solid #94a3b8;border-radius:4px;overflow:hidden;">
        <!-- Tab Font / Advanced -->
        <div style="display:flex;border-bottom:1px solid #cbd5e1;background:#f1f5f9;">
          <button style="padding:5px 14px;font-size:14px;border:none;border-bottom:2px solid #2563eb;background:none;cursor:pointer;font-weight:bold;color:#2563eb;">Font</button>
          <button style="padding:5px 14px;font-size:14px;border:none;border-bottom:2px solid transparent;background:none;cursor:pointer;color:#64748b;">Advanced</button>
        </div>
        <div style="padding:10px;display:flex;flex-direction:column;gap:8px;">
 
          <!-- Font / Style / Size -->
          <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:6px;align-items:start;">
            <div>
              <label style="font-size:14px;color:#374151;display:block;margin-bottom:2px;">Font:</label>
              <select id="pp_font" style="width:100%;font-size:14px;padding:3px 6px;">

                <option value="Arial">Arial</option>
                <option value="Calibri">Calibri</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
              <div style="border:1px solid #cbd5e1;border-radius:3px;margin-top:3px;height:60px;overflow-y:auto;font-size:11px;">
                <div style="padding:2px 6px;cursor:pointer;color:#94a3b8;">+Headings</div>
                <div style="padding:2px 6px;cursor:pointer;" onclick="document.getElementById('pp_font').value='Arial'">Arial</div>
                <div style="padding:2px 6px;cursor:pointer;" onclick="document.getElementById('pp_font').value='Calibri'">Calibri</div>
                <div style="padding:2px 6px;cursor:pointer;" onclick="document.getElementById('pp_font').value='Times New Roman'">Times New Roman</div>
              </div>
            </div>
            <div>
              <label style="font-size:14px;color:#374151;display:block;margin-bottom:2px;">Font style:</label>
              <select id="pp_fontStyle" style="width:100%;font-size:14px;padding:3px 6px;">

                <option value="Regular">Regular</option>
                <option value="Italic">Italic</option>
                <option value="Bold">Bold</option>
                <option value="Bold Italic">Bold Italic</option>
                <option value="Not Bold">Not Bold</option>
              </select>
              <div style="border:1px solid #cbd5e1;border-radius:3px;margin-top:3px;height:60px;overflow-y:auto;font-size:14px;">
                <div style="padding:2px 6px;cursor:pointer;" onclick="document.getElementById('pp_fontStyle').value='Regular'">Regular</div>
                <div style="padding:2px 6px;cursor:pointer;font-style:italic;" onclick="document.getElementById('pp_fontStyle').value='Italic'">Italic</div>
                <div style="padding:2px 6px;cursor:pointer;font-weight:bold;" onclick="document.getElementById('pp_fontStyle').value='Bold'">Bold</div>
                <div style="padding:2px 6px;cursor:pointer;font-weight:bold;font-style:italic;" onclick="document.getElementById('pp_fontStyle').value='Bold Italic'">Bold Italic</div>
                <div style="padding:2px 6px;cursor:pointer;" onclick="document.getElementById('pp_fontStyle').value='Not Bold'">Not Bold</div>
              </div>
            </div>
            <div>
              <label style="font-size:11px;color:#374151;display:block;margin-bottom:2px;">Size:</label>
              <div style="display:flex;align-items:center;gap:3px;">
                <input type="number" id="pp_fontSize" value="12" placeholder="12" min="1" max="999"
                  style="width:52px;font-size:14px;padding:3px 4px;border:1px solid #94a3b8;border-radius:3px;">
                <div style="display:flex;flex-direction:column;gap:1px;">
                  <button onclick="pp_sizeStep(1)"
                    style="width:18px;height:14px;font-size:14px;padding:0;border:1px solid #94a3b8;border-radius:2px;background:#f1f5f9;cursor:pointer;line-height:1;">▲</button>
                  <button onclick="pp_sizeStep(-1)"
                    style="width:18px;height:14px;font-size:14px;padding:0;border:1px solid #94a3b8;border-radius:2px;background:#f1f5f9;cursor:pointer;line-height:1;">▼</button>
                </div>
              </div>
              <div style="border:1px solid #cbd5e1;border-radius:3px;margin-top:3px;height:60px;overflow-y:auto;font-size:11px;">
                <div style="padding:2px 6px;cursor:pointer;" onclick="document.getElementById('pp_fontSize').value=8">8</div>
                <div style="padding:2px 6px;cursor:pointer;" onclick="document.getElementById('pp_fontSize').value=9">9</div>
                <div style="padding:2px 6px;cursor:pointer;" onclick="document.getElementById('pp_fontSize').value=10">10</div>
                <div style="padding:2px 6px;cursor:pointer;" onclick="document.getElementById('pp_fontSize').value=11">11</div>
                <div style="padding:2px 6px;cursor:pointer;" onclick="document.getElementById('pp_fontSize').value=12">12</div>
              </div>
            </div>
          </div>
 
          <!-- Font color / Underline style / Underline color -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
            <div>
              <label style="font-size:14px;color:#374151;display:block;margin-bottom:2px;">Font color:</label>
              <select id="pp_fontColor" style="width:100%;font-size:14px;padding:3px 6px;">

                <option value="No Color">No Color</option>
                <option value="Black, Text 1">Black, Text 1</option>
                <option value="Blue, Accent 1">Blue, Accent 1</option>
                <option value="Red">Red</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px;color:#374151;display:block;margin-bottom:2px;">Underline style:</label>
              <select id="pp_underlineStyle" style="width:100%;font-size:14px;padding:3px 6px;">

                <option value="None">None</option>
                <option value="Single">Single ___</option>
                <option value="Double">Double ===</option>
              </select>
            </div>
            <div>
              <label style="font-size:14px;color:#374151;display:block;margin-bottom:2px;">Underline color:</label>
              <select id="pp_underlineColor" style="width:100%;font-size:14px;padding:3px 6px;">

                <option value="Automatic">Automatic</option>
                <option value="Blue, Accent 1">Blue, Accent 1</option>
                <option value="Red">Red</option>
              </select>
            </div>
          </div>
 
          <!-- Effects -->
          <div class="pp-group-title">Effects</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 14px;">
            <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_strikethrough"> Strikethrough</label>
            <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_smallCaps"> Small caps</label>
            <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_doubleStrike"> Double strikethrough</label>
            <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_allCaps"> All caps</label>
            <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_superscript"> Superscript</label>
            <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_hidden"> Hidden</label>
            <label style="display:flex;align-items:center;gap:5px;font-size:14px;"><input type="checkbox" id="pp_subscript"> Subscript</label>
          </div>
 
        </div>
      </div>
    </div>`;
    box.appendChild(body);
    window._ppFindAction = '';
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '12px';});
}
 
/* Toggle tab (chỉ hiệu ứng visual) */
function pp_setTab(name, btn){
    document.querySelectorAll('.mos-popup-overlay .pp-tab-btn').forEach(function(b){
        b.style.borderBottom='2px solid transparent';
        b.style.fontWeight='normal';
        b.style.color='#64748b';
    });
}
 
/* Toggle More >> */
function pp_toggleMore(){
    const sec = document.getElementById('pp_moreSection');
    const btn = document.getElementById('pp_moreBtn');
    if(!sec||!btn){return;}
    const open = sec.style.display==='block';
    sec.style.display = open ? 'none' : 'block';
    btn.textContent   = open ? 'More >>' : '<< Less';
}
 
/* Tăng/giảm size */
function pp_sizeStep(delta){
    const el = document.getElementById('pp_fontSize');
    if(!el){return;}
    const v = parseInt(el.value)||11;
    el.value = Math.max(1, Math.min(999, v+delta));
}
 
/* Ghi nhận nút bấm rồi check */
function pp_doAction(action){
    window._ppFindAction = action;
    checkFindReplacePopup();
}
 
function checkFindReplacePopup(){
    _hidePopupError('pp_err_findreplace');
    const a = window._ppAns||{};
 
    const findWhat     = document.getElementById('pp_findWhat').value.trim();
    const replaceWith  = document.getElementById('pp_replaceWith').value.trim();
    const action       = window._ppFindAction||'';
    const search       = document.getElementById('pp_search').value;
    const matchCase    = document.getElementById('pp_matchCase').checked;
    const findWhole    = document.getElementById('pp_findWholeWords').checked;
    const useWild      = document.getElementById('pp_useWildcards').checked;
    const soundsLike   = document.getElementById('pp_soundsLike').checked;
    const findAllWord  = document.getElementById('pp_findAllWordForms').checked;
    const matchPrefix  = document.getElementById('pp_matchPrefix').checked;
    const matchSuffix  = document.getElementById('pp_matchSuffix').checked;
    const ignorePunct  = document.getElementById('pp_ignorePunct').checked;
    const ignoreWhite  = document.getElementById('pp_ignoreWhite').checked;
    const font         = document.getElementById('pp_font').value;
    const fontStyle    = document.getElementById('pp_fontStyle').value;
    const fontSize     = parseInt(document.getElementById('pp_fontSize').value);
    const fontColor    = document.getElementById('pp_fontColor').value;
    const underlineSt  = document.getElementById('pp_underlineStyle').value;
    const underlineClr = document.getElementById('pp_underlineColor').value;
    const strikethrough      = document.getElementById('pp_strikethrough').checked;
    const doubleStrike       = document.getElementById('pp_doubleStrike').checked;
    const superscript        = document.getElementById('pp_superscript').checked;
    const subscript          = document.getElementById('pp_subscript').checked;
    const smallCaps          = document.getElementById('pp_smallCaps').checked;
    const allCaps            = document.getElementById('pp_allCaps').checked;
    const hidden             = document.getElementById('pp_hidden').checked;
 
    let errors=[];
    if(a.findWhat   !==undefined && findWhat   !==a.findWhat)    errors.push('Find what→"'+a.findWhat+'"');
    if(a.replaceWith!==undefined && replaceWith!==a.replaceWith) errors.push('Replace with→"'+a.replaceWith+'"');
    if(a.action      && action   !==a.action)                    errors.push('Nút bấm→'+a.action);
    if(a.search      && search   !==a.search)                    errors.push('Search→'+a.search);
    if(a.matchCase        !==undefined && matchCase  !==a.matchCase)        errors.push('MatchCase→'+a.matchCase);
    if(a.findWholeWords   !==undefined && findWhole  !==a.findWholeWords)   errors.push('FindWholeWords→'+a.findWholeWords);
    if(a.useWildcards     !==undefined && useWild    !==a.useWildcards)     errors.push('UseWildcards→'+a.useWildcards);
    if(a.soundsLike       !==undefined && soundsLike !==a.soundsLike)       errors.push('SoundsLike→'+a.soundsLike);
    if(a.findAllWordForms !==undefined && findAllWord!==a.findAllWordForms)  errors.push('FindAllWordForms→'+a.findAllWordForms);
    if(a.matchPrefix      !==undefined && matchPrefix!==a.matchPrefix)       errors.push('MatchPrefix→'+a.matchPrefix);
    if(a.matchSuffix      !==undefined && matchSuffix!==a.matchSuffix)       errors.push('MatchSuffix→'+a.matchSuffix);
    if(a.ignorePunctuation!==undefined && ignorePunct!==a.ignorePunctuation) errors.push('IgnorePunct→'+a.ignorePunctuation);
    if(a.ignoreWhiteSpace !==undefined && ignoreWhite!==a.ignoreWhiteSpace)  errors.push('IgnoreWhite→'+a.ignoreWhiteSpace);
    if(a.font        && font       !==a.font)        errors.push('Font→'+a.font);
    if(a.fontStyle   && fontStyle  !==a.fontStyle)   errors.push('FontStyle→'+a.fontStyle);
    if(a.size!==undefined&&(isNaN(fontSize)||fontSize!==a.size)) errors.push('Size→'+a.size);
    if(a.fontColor      && fontColor   !==a.fontColor)    errors.push('FontColor→'+a.fontColor);
    if(a.underlineStyle && underlineSt !==a.underlineStyle) errors.push('UnderlineStyle→'+a.underlineStyle);
    if(a.underlineColor && underlineClr!==a.underlineColor) errors.push('UnderlineColor→'+a.underlineColor);
    if(a.strikethrough       !==undefined&&strikethrough !==a.strikethrough)        errors.push('Strikethrough→'+a.strikethrough);
    if(a.doubleStrikethrough !==undefined&&doubleStrike  !==a.doubleStrikethrough)  errors.push('DoubleStrike→'+a.doubleStrikethrough);
    if(a.superscript         !==undefined&&superscript   !==a.superscript)          errors.push('Superscript→'+a.superscript);
    if(a.subscript           !==undefined&&subscript     !==a.subscript)            errors.push('Subscript→'+a.subscript);
    if(a.smallCaps           !==undefined&&smallCaps     !==a.smallCaps)            errors.push('SmallCaps→'+a.smallCaps);
    if(a.allCaps             !==undefined&&allCaps       !==a.allCaps)              errors.push('AllCaps→'+a.allCaps);
    if(a.hidden              !==undefined&&hidden        !==a.hidden)               errors.push('Hidden→'+a.hidden);
 
    if(errors.length){_showPopupError('pp_err_findreplace','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
12.   POPUP WORD OPTIONS — DISPLAY //copy từng đoạn vào HTML
popupType: 'word-display',
popupAnswer: {
     // Page display options
     showWhiteSpace:    true,
     showHighlighter:   true,
     showTooltips:      true,
     // Formatting marks	là  showAllFormattingMarks:      false,
     tabChars:          true,
     spaces:            false,
     paragraphMarks:    false,
     hiddenText:        false,
     optionalHyphens:   false,
     objectAnchors:     true,
     showAllMarks:      false,
     // Printing options
     printDrawings:     true,
     printBgColors:     false,
     printDocProps:     false,
     printHiddenText:   false,
     updateFieldsBefore:false,
     updateLinkedBefore:false,
   }},
============================================================ */
function openWordDisplayPopup(step){
    const box = _createPopupShell('Word Options — Display');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        showWhiteSpace:    ('showWhiteSpace'    in ans)?ans.showWhiteSpace    :undefined,
        showHighlighter:   ('showHighlighter'   in ans)?ans.showHighlighter   :undefined,
        showTooltips:      ('showTooltips'      in ans)?ans.showTooltips      :undefined,
        tabChars:          ('tabChars'          in ans)?ans.tabChars          :undefined,
        spaces:            ('spaces'            in ans)?ans.spaces            :undefined,
        paragraphMarks:    ('paragraphMarks'    in ans)?ans.paragraphMarks    :undefined,
        hiddenText:        ('hiddenText'        in ans)?ans.hiddenText        :undefined,
        optionalHyphens:   ('optionalHyphens'   in ans)?ans.optionalHyphens   :undefined,
        objectAnchors:     ('objectAnchors'     in ans)?ans.objectAnchors     :undefined,
        showAllMarks:      ('show AllMarks'      in ans)?ans.showAllMarks      :undefined,
        printDrawings:     ('printDrawings'     in ans)?ans.printDrawings     :undefined,
        printBgColors:     ('printBgColors'     in ans)?ans.printBgColors     :undefined,
        printDocProps:     ('printDocProps'     in ans)?ans.printDocProps     :undefined,
        printHiddenText:   ('printHiddenText'   in ans)?ans.printHiddenText   :undefined,
        updateFieldsBefore:('updateFieldsBefore'in ans)?ans.updateFieldsBefore:undefined,
        updateLinkedBefore:('updateLinkedBefore'in ans)?ans.updateLinkedBefore:undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:600px;gap:4px;';
    body.innerHTML = `
    <div style="display:grid;grid-template-columns:3fr 2fr;gap:10px;align-items:start;">

      <!-- CỘT TRÁI: Page display + Formatting marks -->
      <div style="display:flex;flex-direction:column;gap:1px;">

        <!-- Page display options -->
        <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:8px;">
          <div class="pp-group-title" style="margin-top:2;margin-bottom:8px;">Page display options</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_showWhiteSpace" >
              Show white space between pages in Print Layout view
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_showHighlighter" >
              Show highlighter marks
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_showTooltips" >
              Show document tooltips on hover
            </label>
          </div>
        </div>

        <!-- Formatting marks -->
        <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:8px;">
          <div class="pp-group-title" style="margin-top:6;margin-bottom:8px;">Always show these formatting marks on the screen</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_tabChars">
              Tab characters <span style="color:#64748b;margin-left:auto;">→</span>
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_spaces">
              Spaces <span style="color:#64748b;margin-left:auto;">···</span>
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_paragraphMarks">
              Paragraph marks <span style="color:#64748b;margin-left:auto;">¶</span>
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_hiddenText">
              Hidden text <span style="color:#64748b;margin-left:auto;text-decoration:underline;">abc</span>
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_optionalHyphens">
              Optional hyphens <span style="color:#64748b;margin-left:auto;">¬</span>
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_objectAnchors" >
              Object anchors <span style="color:#64748b;margin-left:auto;">⚓</span>
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_showAllMarks">
              Show all formatting marks
            </label>
          </div>
        </div>

      </div>

      <!-- CỘT PHẢI: Printing options -->
      <div>
        <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:8px;">
          <div class="pp-group-title" style="margin-top:2;margin-bottom:8px;">Printing options</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_printDrawings" >
              Print drawings created in Word
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_printBgColors">
              Print background colors and images
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_printDocProps">
              Print document properties
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_printHiddenText">
              Print hidden text
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_updateFieldsBefore">
              Update fields before printing
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="pp_updateLinkedBefore">
              Update linked data before printing
            </label>
          </div>
        </div>
      </div>

    </div>

    <div class="pp-error" id="pp_err_worddisplay"></div>
    <div class="pp-btn-row">
      <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
      <button class="pp-btn pp-btn-ok" onclick="checkWordDisplayPopup()">OK</button>
    </div>`;
    box.appendChild(body);
    box.style.maxWidth = '98%';
    window._ppFindAction = '';
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});
}
function checkWordDisplayPopup(){
    _hidePopupError('pp_err_worddisplay');
    const a = window._ppAns||{};
    const v = {
        showWhiteSpace:    document.getElementById('pp_showWhiteSpace').checked,
        showHighlighter:   document.getElementById('pp_showHighlighter').checked,
        showTooltips:      document.getElementById('pp_showTooltips').checked,
        tabChars:          document.getElementById('pp_tabChars').checked,
        spaces:            document.getElementById('pp_spaces').checked,
        paragraphMarks:    document.getElementById('pp_paragraphMarks').checked,
        hiddenText:        document.getElementById('pp_hiddenText').checked,
        optionalHyphens:   document.getElementById('pp_optionalHyphens').checked,
        objectAnchors:     document.getElementById('pp_objectAnchors').checked,
        showAllMarks:      document.getElementById('pp_showAllMarks').checked,
        printDrawings:     document.getElementById('pp_printDrawings').checked,
        printBgColors:     document.getElementById('pp_printBgColors').checked,
        printDocProps:     document.getElementById('pp_printDocProps').checked,
        printHiddenText:   document.getElementById('pp_printHiddenText').checked,
        updateFieldsBefore:document.getElementById('pp_updateFieldsBefore').checked,
        updateLinkedBefore:document.getElementById('pp_updateLinkedBefore').checked,
    };
    let errors=[];
    Object.keys(a).forEach(function(k){
        if(a[k]!==undefined && v[k]!==a[k]) errors.push(k+'→'+a[k]);
    });
    if(errors.length){_showPopupError('pp_err_worddisplay','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}


/* ============================================================
14. POPUP HYPERLINK
   popupType: 'hyperlink' (chỉ copy 1 Answer duy nhất)
   ============================================================
popupType: 'hyperlink',
popupAnswer: {
    linkExistingFile: true,
    textToDisplay:    'Click here',
    address:          'https://example.com',
	}
popupType: 'hyperlink',
popupAnswer: {
    linkPlaceInDoc: true,
    placeTop:       true,
	}
popupType: 'hyperlink',
popupAnswer: {
    linkCreateNew: true,
    nameNewDoc:    'NewFile.docx',
    editNow:       true,
	}
popupType: 'hyperlink',
popupAnswer: {
    linkEmail:    true,
    emailAddress: 'test@email.com',
    emailSubject: 'Hello',
	}
============================================================ */
function openHyperlinkPopup(step){
    const box = _createPopupShell('Insert Hyperlink');
    const ans = step.popupAnswer || {};

    /* ── Giải mã tab active ── */
    const activeTab = ans.linkPlaceInDoc  ? 'place'
                    : ans.linkCreateNew   ? 'create'
                    : ans.linkEmail       ? 'email'
                    : 'existing';

    window._ppAns = {
        activeTab:     activeTab,
        textToDisplay: ('textToDisplay' in ans) ? ans.textToDisplay : undefined,
        address:       ('address'       in ans) ? ans.address       : undefined,
        placeTop:      ('placeTop'      in ans) ? ans.placeTop      : undefined,
        placeHeadings: ('placeHeadings' in ans) ? ans.placeHeadings : undefined,
        placeBookmarks:('placeBookmarks'in ans) ? ans.placeBookmarks: undefined,
        nameNewDoc:    ('nameNewDoc'    in ans) ? ans.nameNewDoc    : undefined,
        editLater:     ('editLater'     in ans) ? ans.editLater     : undefined,
        editNow:       ('editNow'       in ans) ? ans.editNow       : undefined,
        emailAddress:  ('emailAddress'  in ans) ? ans.emailAddress  : undefined,
        emailSubject:  ('emailSubject'  in ans) ? ans.emailSubject  : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:560px;gap:4px;padding:10px 14px;';
    body.innerHTML = `
    <div style="display:grid;grid-template-columns:120px 1fr;gap:2px;align-items:start;">

      <!-- CỘT TRÁI: Link to -->
      <div style="display:flex;flex-direction:column;gap:2px;">
        <div style="font-size:12px;font-weight:bold;color:#1e3a5f;margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid #cbd5e1;">Link to:</div>

        <button id="pp_tab_existing" onclick="pp_hlTab('existing')"
          style="text-align:left;padding:6px 8px;border:1px solid #2563eb;border-radius:4px;
                 font-size:12px;cursor:pointer;background:#dbeafe;color:#1d4ed8;font-weight:bold;margin-bottom:2px;">
          📄 Existing File<br>or Web Page
        </button>

        <button id="pp_tab_place" onclick="pp_hlTab('place')"
          style="text-align:left;padding:6px 8px;border:1px solid #e2e8f0;border-radius:4px;
                 font-size:12px;cursor:pointer;background:#f8fafc;color:#374151;margin-bottom:2px;">
          📌 Place in This<br>Document
        </button>

        <button id="pp_tab_create" onclick="pp_hlTab('create')"
          style="text-align:left;padding:6px 8px;border:1px solid #e2e8f0;border-radius:4px;
                 font-size:12px;cursor:pointer;background:#f8fafc;color:#374151;margin-bottom:2px;">
          📝 Create New<br>Document
        </button>

        <button id="pp_tab_email" onclick="pp_hlTab('email')"
          style="text-align:left;padding:6px 8px;border:1px solid #e2e8f0;border-radius:4px;
                 font-size:12px;cursor:pointer;background:#f8fafc;color:#374151;">
          ✉️ E-mail<br>Address
        </button>
      </div>

      <!-- CỘT PHẢI: Nội dung tab -->
      <div id="pp_hl_content" style="display:flex;flex-direction:column;gap:12px;">
        <!-- Nội dung sẽ render theo tab -->
      </div>

    </div>

    <div class="pp-error" id="pp_err_hyperlink"></div>
    <div class="pp-btn-row" style="margin-top:8px;">
      <button class="pp-btn" style="font-size:16px;padding:4px 12px;"
        onclick="pp_hlScreenTip()">ScreenTip...</button>
      <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
      <button class="pp-btn pp-btn-ok" onclick="checkHyperlinkPopup()">OK</button>
    </div>`;
    box.appendChild(body);
    window._ppFindAction = '';
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

    /* Render tab mặc định */
    pp_hlTab(activeTab);
}

/* ── Render nội dung từng tab ── */
function pp_hlTab(tab){
    window._ppActiveTab = tab;

    /* Cập nhật style nút tab */
    ['existing','place','create','email'].forEach(function(t){
        const btn = document.getElementById('pp_tab_'+t);
        if(!btn){return;}
        if(t===tab){
            btn.style.background='#dbeafe'; btn.style.color='#1d4ed8';
            btn.style.border='1px solid #2563eb'; btn.style.fontWeight='bold';
        } else {
            btn.style.background='#f8fafc'; btn.style.color='#374151';
            btn.style.border='1px solid #e2e8f0'; btn.style.fontWeight='normal';
        }
    });

    const content = document.getElementById('pp_hl_content');
    if(!content){return;}

    if(tab==='existing'){
        content.innerHTML = `
        <div>
          <label style="font-size:16px;display:block;margin-bottom:3px;">Text to display:</label>
          <input type="text" id="pp_textDisplay" value="" placeholder="Nhập text hiển thị..."
            style="width:100%;padding:8px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:16px;display:block;margin-bottom:3px;">Look in:</label>
          <div style="display:flex;gap:4px;">
            <select id="pp_lookIn" style="flex:1;font-size:14px;padding:4px 6px;">
              <option value="">- Lựa chọn đường dẫn -</option>
              <option value="Current Folder">Current Folder</option>
              <option value="Browsed Pages">Browsed Pages</option>
              <option value="Recent Files">Recent Files</option>
            </select>
            <button class="pp-btn" style="font-size:11px;padding:3px 8px;">Browse...</button>
          </div>
        </div>
        <div>
          <label style="font-size:16px;display:block;margin-bottom:3px;">Address:</label>
          <input type="text" id="pp_address" value="" placeholder="https:// hoặc đường dẫn file..."
            style="width:100%;padding:4px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;box-sizing:border-box;">
        </div>`;

    } else if(tab==='place'){
        content.innerHTML = `
        <div>
          <label style="font-size:16px;display:block;margin-bottom:3px;">Text to display:</label>
          <input type="text" id="pp_textDisplay" value="" placeholder="Nhập text hiển thị..."
            style="width:100%;padding:8px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:12px;display:block;margin-bottom:3px;">Select a place in this document:</label>
          <div style="border:1px solid #94a3b8;border-radius:4px;overflow:hidden;">
            <div id="pp_place_top" onclick="pp_hlSelectPlace('top')"
              style="padding:6px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;border-bottom:1px solid #e2e8f0;background:#f8fafc;">
              <input type="radio" name="pp_place" value="top"> Top of the Document
            </div>
            <div id="pp_place_headings" onclick="pp_hlSelectPlace('headings')"
              style="padding:6px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;border-bottom:1px solid #e2e8f0;background:#f8fafc;">
              <input type="radio" name="pp_place" value="headings"> Headings
            </div>
            <div id="pp_place_bookmarks" onclick="pp_hlSelectPlace('bookmarks')"
              style="padding:6px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;background:#f8fafc;">
              <input type="radio" name="pp_place" value="bookmarks"> Bookmarks
            </div>
          </div>
        </div>`;

    } else if(tab==='create'){
        content.innerHTML = `
        <div>
          <label style="font-size:12px;display:block;margin-bottom:3px;">Text to display:</label>
          <input type="text" id="pp_textDisplay" value="" placeholder="Nhập text hiển thị..."
            style="width:100%;padding:8px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:12px;display:block;margin-bottom:3px;">Name of new document:</label>
          <div style="display:flex;gap:4px;">
            <input type="text" id="pp_nameNewDoc" value="" placeholder="Nhập tên file..."
              style="flex:1;padding:4px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;">
            <button class="pp-btn" style="font-size:11px;padding:3px 8px;">Change...</button>
          </div>
        </div>
        <div>
          <label style="font-size:12px;display:block;margin-bottom:4px;">When to edit:</label>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="radio" name="pp_editWhen" id="pp_editLater" value="later">
              Edit the new document later
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="radio" name="pp_editWhen" id="pp_editNow" value="now">
              Edit the new document now
            </label>
          </div>
        </div>`;

    } else if(tab==='email'){
        content.innerHTML = `
        <div>
          <label style="font-size:16px;display:block;margin-bottom:3px;">Text to display:</label>
          <input type="text" id="pp_textDisplay" value="" placeholder="Nhập text hiển thị..."
            style="width:100%;padding:8px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:16px;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:16px;display:block;margin-bottom:3px;">E-mail address:</label>
          <input type="text" id="pp_emailAddr" value="" placeholder="example@email.com"
            style="width:100%;padding:8px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:16px;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:16px;display:block;margin-bottom:3px;">Subject:</label>
          <input type="text" id="pp_emailSubject" value="" placeholder="Nhập tiêu đề email..."
            style="width:100%;padding:8px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:16px;box-sizing:border-box;">
        </div>`;
    }
}

function pp_hlSelectPlace(val){
    document.querySelectorAll('input[name="pp_place"]').forEach(function(r){
        r.checked = (r.value===val);
    });
}
function pp_hlScreenTip(){ /* placeholder */ }

/* ── Hàm check ── */
function checkHyperlinkPopup(){
    _hidePopupError('pp_err_hyperlink');
    const a   = window._ppAns||{};
    const tab = window._ppActiveTab||'existing';
    let errors=[];

    /* Kiểm tra đúng tab */
    if(a.activeTab && tab!==a.activeTab) errors.push('Link to→'+a.activeTab);

    /* Text to display — có ở tất cả tab */
    const textEl = document.getElementById('pp_textDisplay');
    const text   = textEl ? textEl.value.trim() : '';
    if(a.textToDisplay!==undefined && text!==a.textToDisplay) errors.push('Text to display→"'+a.textToDisplay+'"');

    if(tab==='existing'){
        const addr = (document.getElementById('pp_address')||{}).value||'';
        if(a.address!==undefined && addr.trim()!==a.address) errors.push('Address→"'+a.address+'"');

    } else if(tab==='place'){
        const checked = document.querySelector('input[name="pp_place"]:checked');
        const val     = checked ? checked.value : '';
        if(a.placeTop      !==undefined && (val==='top')      !==a.placeTop)       errors.push('Top of Document→'+a.placeTop);
        if(a.placeHeadings !==undefined && (val==='headings') !==a.placeHeadings)  errors.push('Headings→'+a.placeHeadings);
        if(a.placeBookmarks!==undefined && (val==='bookmarks')!==a.placeBookmarks) errors.push('Bookmarks→'+a.placeBookmarks);

    } else if(tab==='create'){
        const nameDoc  = (document.getElementById('pp_nameNewDoc')||{}).value||'';
        const editLater= (document.getElementById('pp_editLater')||{}).checked||false;
        const editNow  = (document.getElementById('pp_editNow')  ||{}).checked||false;
        if(a.nameNewDoc!==undefined && nameDoc.trim()!==a.nameNewDoc) errors.push('Name→"'+a.nameNewDoc+'"');
        if(a.editLater !==undefined && editLater!==a.editLater)       errors.push('EditLater→'+a.editLater);
        if(a.editNow   !==undefined && editNow  !==a.editNow)         errors.push('EditNow→'+a.editNow);

    } else if(tab==='email'){
        const emailAddr = (document.getElementById('pp_emailAddr')   ||{}).value||'';
        const emailSubj = (document.getElementById('pp_emailSubject') ||{}).value||'';
        if(a.emailAddress!==undefined && emailAddr.trim()!==a.emailAddress) errors.push('Email→"'+a.emailAddress+'"');
        if(a.emailSubject !==undefined && emailSubj.trim()!==a.emailSubject) errors.push('Subject→"'+a.emailSubject+'"');
    }

    if(errors.length){_showPopupError('pp_err_hyperlink','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
  15. POPUP SET NUMBERING VALUE //copy vào HTML
   popupType: 'set-numbering'
   ============================================================
popupType:   'set-numbering',
popupAnswer: {
      	startNewList:         true,   
      	continueFromPrevious: false,   
      	advanceValue:         false,   
      	setValue:             1    }},
============================================================ */

function openSetNumberingPopup(step){
    const box = _createPopupShell('Set Numbering Value');
    const ans = step.popupAnswer || {};
    const ansMode = ans.continueFromPrevious ? 'continue' : 'new';
    window._ppAns = {
        mode:         ansMode,
        advanceValue: ('advanceValue' in ans) ? ans.advanceValue : undefined,
        setValue:     ('setValue'     in ans) ? ans.setValue     : undefined,
    };
    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:260px;gap:10px;';
    body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;">
            <input type="radio" name="pp_numMode" id="pp_modeNew" value="new" checked
                onchange="pp_toggleNumMode()">
            Start new list
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;">
            <input type="radio" name="pp_numMode" id="pp_modeContinue" value="continue"
                onchange="pp_toggleNumMode()">
            Continue from previous list
        </label>
        <label id="pp_advanceLabel"
            style="display:flex;align-items:center;gap:8px;font-size:14px;
                   margin-left:20px;color:#94a3b8;cursor:not-allowed;">
            <input type="checkbox" id="pp_advanceValue" disabled>
            Advance value (skip numbers)
        </label>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:14px;font-weight:bold;color:#374151;">Set value to:</label>
        <div style="display:flex;align-items:center;gap:4px;">
            <input type="number" id="pp_setValue" min="0" value="0"
                style="width:60px;padding:4px 8px;border:1px solid #94a3b8;
                       border-radius:3px;font-size:13px;text-align:center;"
                oninput="pp_updatePreview()">
            <div style="display:flex;flex-direction:column;gap:1px;">
                <button onclick="pp_stepValue(1)"
                    style="width:20px;height:14px;font-size:9px;padding:0;
                           border:1px solid #94a3b8;border-radius:2px;
                           background:#f1f5f9;cursor:pointer;line-height:1;">▲</button>
                <button onclick="pp_stepValue(-1)"
                    style="width:20px;height:14px;font-size:9px;padding:0;
                           border:1px solid #94a3b8;border-radius:2px;
                           background:#f1f5f9;cursor:pointer;line-height:1;">▼</button>
            </div>
        </div>
        <div id="pp_numPreview" style="font-size:12px;color:#64748b;margin-top:2px;">Preview: 0.</div>
    </div>
    <div class="pp-error" id="pp_err_setnumbering"></div>
    <div class="pp-btn-row">
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkSetNumberingPopup()">OK</button>
    </div>`;
    box.appendChild(body);
}
function pp_toggleNumMode(){
    const isContinue = document.getElementById('pp_modeContinue').checked;
    const advChk = document.getElementById('pp_advanceValue');
    const advLbl = document.getElementById('pp_advanceLabel');
    if(!advChk||!advLbl){return;}
    advChk.disabled     = !isContinue;
    advLbl.style.color  = isContinue ? '#374151' : '#94a3b8';
    advLbl.style.cursor = isContinue ? 'pointer' : 'not-allowed';
    if(!isContinue){ advChk.checked = false; }
}
function pp_stepValue(delta){
    const el = document.getElementById('pp_setValue');
    if(!el){return;}
    el.value = Math.max(0, (parseInt(el.value)||1) + delta);
    pp_updatePreview();
}
function pp_updatePreview(){
    const el  = document.getElementById('pp_setValue');
    const prv = document.getElementById('pp_numPreview');
    if(!el||!prv){return;}
    prv.textContent = 'Preview: ' + (parseInt(el.value)||1) + '.';
}
function checkSetNumberingPopup(){
    _hidePopupError('pp_err_setnumbering');
    const a       = window._ppAns||{};
    const modeEl  = document.querySelector('input[name="pp_numMode"]:checked');
    const mode    = modeEl ? modeEl.value : '';
    const advChk  = document.getElementById('pp_advanceValue');
    const advance = advChk ? advChk.checked : false;
    const setValue= parseInt(document.getElementById('pp_setValue').value)||0;
    let errors=[];
    if(a.mode      && mode!==a.mode)
        errors.push('Mode→'+(a.mode==='new'?'Start new list':'Continue from previous list'));
    if(a.advanceValue!==undefined && advance!==a.advanceValue)
        errors.push('AdvanceValue→'+a.advanceValue);
    if(a.setValue!==undefined&&(isNaN(setValue)||setValue!==a.setValue))
        errors.push('Set value to→'+a.setValue);
    if(errors.length){_showPopupError('pp_err_setnumbering','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ==========================================================================
   POPUP 16: SMARTART TEXT EDITOR (CẤU TRÚC MẢNG CHUẨN NGHỆ SĨ)
//dòng 1 mặc định, dòng 2 đáp án
popupType: 'smartart-text',
popupAnswer: {
    	init: ['Saturday', 'Sunday', 'Ethan Hawke'], 
    	ans:  ['Ethan Hawke', 'Saturday', 'Sunday'] }},

//mặc định 4 dòng, dư xóa	//thay đổi số mặc định: initialRows = isExact ? targetAns.length : 3;
popupType: 'smartart-text',
popupAnswer: {
    	ans: ['Saturday', 'Sunday', 'Ethan Hawke'] }},

//mặc định dòng đúng đáp án, không xóa
popupType: 'smartart-text',
popupAnswer: {
    	exact: true,
    	ans: ['Saturday', 'Sunday', 'Ethan Hawke'] }},
   ========================================================================== */

function openSmartArtPopup(step){
    const box = _createPopupShell('Type your text here');
    const ansObj = step.popupAnswer || {};

    /* 1. Chuẩn hóa dữ liệu đầu vào */
    const targetAns = Array.isArray(ansObj.ans) ? ansObj.ans : [];
    const initList  = Array.isArray(ansObj.init) ? ansObj.init : null;
    const isExact   = ansObj.exact === true;

    /* 2. Lưu đáp án chấm điểm vào biến toàn cục */
    window._ppAns = {
        ans: targetAns,
        lineCount: targetAns.length
    };

    /* 3. Tự động xác định danh sách chữ & số ô hiển thị ban đầu */
    let defLines = [];
    let initialRows = 4;

    if (initList && initList.length > 0) {
        // Dạng 1: Sắp xếp (Reorder) -> Lấy chữ từ mảng init
        defLines = [...initList];
        initialRows = initList.length;
    } else {
        // Dạng 2 & 3: Nhập mới -> Để ô trống tinh
        initialRows = isExact ? targetAns.length : 3;
        for (let i = 0; i < initialRows; i++) {
            defLines.push('');
        }
    }

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:480px;gap:8px;padding:10px 14px;';
    body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;">

      <!-- CỘT TRÁI: Editor -->
      <div style="display:flex;flex-direction:column;gap:2px;">
        <div style="font-size:13px;color:#64748b;line-height:1.6;">
          Enter = thêm dòng &nbsp;|&nbsp; Delete đầu dòng trống = xóa dòng<br>
          <span style="color:#2563eb;font-weight:600;">↑ Move Up</span> /
          <span style="color:#2563eb;font-weight:600;">↓ Move Down</span> = đổi thứ tự
        </div>

        <div id="pp_sa_editor"
          style="border:2px solid #bfdbfe;border-radius:4px;background:#fff;
                 padding:4px;min-height:180px;display:flex;flex-direction:column;">
        </div>

        <div style="font-size:14px;color:#64748b;text-align:center;">
          Số dòng hiện tại: <span id="pp_sa_count" style="font-weight:bold;color:#2563eb;">0</span>
        </div>
      </div>

      <!-- CỘT PHẢI: Preview -->
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div style="font-size:14px;color:#64748b;">Preview</div>
        <div id="pp_sa_preview"
          style="display:flex;flex-direction:column;gap:4px;
                 background:#f0f7ff;border:1px solid #dbeafe;
                 border-radius:4px;padding:8px;min-height:180px;">
        </div>
        <div style="font-size:14px;color:#94a3b8;border:1px solid #e2e8f0;
                    border-radius:4px;padding:6px;background:#f8fafc;">
          <strong style="color:#374151;">Vertical Box List</strong><br>
          Use to show several groups of information.
        </div>
      </div>
    </div>

    <div class="pp-error" id="pp_err_smartart"></div>
    <div class="pp-btn-row">
      <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
      <button class="pp-btn pp-btn-ok" onclick="checkSmartArtPopup()">OK</button>
    </div>`;

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button').forEach(el=>{ el.style.fontSize = '14px'; });

    /* Dựng giao diện các dòng mặc định */
    pp_saBuildRows(initialRows, defLines);

    /* Focus vào ô đầu tiên */
    setTimeout(function(){
        const first = document.querySelector('#pp_sa_editor .pp-sa-input');
        if(first){ first.focus(); }
    }, 50);
}

function pp_saBuildRows(count, values){
    const editor = document.getElementById('pp_sa_editor');
    if(!editor){ return; }
    editor.innerHTML = '';

    for(let i = 0; i < count; i++){
        const val = (values && values[i] !== undefined) ? values[i] : '';
        pp_saAppendRow(editor, val);
    }
    pp_saUpdatePreview();
}

function pp_saAppendRow(container, val){
    const row = document.createElement('div');
    row.className = 'pp-sa-row';
    row.style.cssText = 'display:flex;align-items:center;gap:4px;margin-bottom:3px;';

    var safeVal = String(val || '').replace(/"/g, '&quot;');

    row.innerHTML = `
        <span style="color:#94a3b8;font-size:12px;cursor:grab;">⋮⋮</span>
        <span style="font-size:10px;color:#2563eb;">●</span>
        <input type="text" class="pp-sa-input" value="${safeVal}"
          style="flex:1;border:1px solid #cbd5e1;border-radius:3px;padding:3px 6px;
                 font-size:13px;outline:none;"
          onkeydown="pp_saKeyDown(event, this)"
          onpaste="pp_saPaste(event, this)"
          oninput="pp_saUpdatePreview()" />
        <button type="button" title="Move Up" onclick="pp_saMoveRow(this, -1)"
          style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:3px;
                 padding:1px 5px;font-size:11px;cursor:pointer;color:#2563eb;">↑</button>
        <button type="button" title="Move Down" onclick="pp_saMoveRow(this, 1)"
          style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:3px;
                 padding:1px 5px;font-size:11px;cursor:pointer;color:#2563eb;">↓</button>
    `;
    container.appendChild(row);
}

function pp_saUpdatePreview(){
    const editor = document.getElementById('pp_sa_editor');
    const prev   = document.getElementById('pp_sa_preview');
    const cnt    = document.getElementById('pp_sa_count');
    if(!editor || !prev){ return; }

    const inputs = editor.querySelectorAll('.pp-sa-input');
    if(cnt){ cnt.textContent = inputs.length; }

    prev.innerHTML = '';
    inputs.forEach(function(inp){
        const txt = inp.value.trim() || '(Empty)';
        const box = document.createElement('div');
        box.style.cssText = 'background:#2563eb;color:#fff;padding:6px 10px;' +
                            'border-radius:4px;font-size:12px;font-weight:500;' +
                            'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
        box.textContent = '■  ' + txt;
        prev.appendChild(box);
    });
}

function pp_saPaste(e, input){
    const clipboardData = (e.clipboardData || window.clipboardData);
    if(!clipboardData) return;

    const pastedText = clipboardData.getData('text');
    if(pastedText && (pastedText.includes('\n') || pastedText.includes('\r'))){
        e.preventDefault();
        const lines = pastedText.split(/\r?\n/).filter(function(line){ return line.trim() !== ''; });
        if(lines.length === 0) return;

        const row = input.closest('.pp-sa-row');
        const editor = document.getElementById('pp_sa_editor');

        input.value = lines[0];
        let currRow = row;

        for(let i = 1; i < lines.length; i++){
            if(editor.querySelectorAll('.pp-sa-row').length >= 10) break;
            const tempDiv = document.createElement('div');
            pp_saAppendRow(tempDiv, lines[i]);
            const newRow = tempDiv.firstElementChild;
            currRow.insertAdjacentElement('afterend', newRow);
            currRow = newRow;
        }
        pp_saUpdatePreview();
    }
}

function pp_saKeyDown(e, input){
    const row   = input.closest('.pp-sa-row');
    const editor= document.getElementById('pp_sa_editor');
    const rows  = Array.from(editor.querySelectorAll('.pp-sa-row'));
    const idx   = rows.indexOf(row);
    const cursor= input.selectionStart;

    if(e.key === 'Enter'){
        e.preventDefault();
        if(rows.length >= 10){ return; }

        const before = input.value.substring(0, cursor);
        const after  = input.value.substring(cursor);
        input.value  = before;

        const tempDiv = document.createElement('div');
        pp_saAppendRow(tempDiv, after);
        const newRow = tempDiv.firstElementChild;

        rows[idx].insertAdjacentElement('afterend', newRow);
        pp_saUpdatePreview();

        const newInp = newRow.querySelector('.pp-sa-input');
        setTimeout(function(){
            newInp.focus();
            newInp.setSelectionRange(0, 0);
        }, 20);
    }
    else if(e.key === 'Backspace' && cursor === 0){
        if(input.value === '' && rows.length > 1){
            e.preventDefault();
            const prevInp = rows[idx - 1] ? rows[idx - 1].querySelector('.pp-sa-input') : null;
            row.remove();
            pp_saUpdatePreview();
            if(prevInp){
                prevInp.focus();
                prevInp.setSelectionRange(prevInp.value.length, prevInp.value.length);
            }
        }
    }
    else if(e.key === 'Delete' && cursor === input.value.length){
        if(input.value === '' && rows.length > 1){
            e.preventDefault();
            const nextInp = rows[idx + 1] ? rows[idx + 1].querySelector('.pp-sa-input') : null;
            row.remove();
            pp_saUpdatePreview();
            if(nextInp){
                nextInp.focus();
                nextInp.setSelectionRange(0, 0);
            }
        }
    }
    else if(e.key === 'ArrowUp' && idx > 0){
        rows[idx - 1].querySelector('.pp-sa-input').focus();
    }
    else if(e.key === 'ArrowDown' && idx < rows.length - 1){
        rows[idx + 1].querySelector('.pp-sa-input').focus();
    }
}

function pp_saMoveRow(btn, dir){
    const row   = btn.closest('.pp-sa-row');
    const editor= document.getElementById('pp_sa_editor');
    const rows  = Array.from(editor.querySelectorAll('.pp-sa-row'));
    const idx   = rows.indexOf(row);
    const target= idx + dir;

    if(target < 0 || target >= rows.length){ return; }

    if(dir === -1){
        editor.insertBefore(row, rows[target]);
    } else {
        editor.insertBefore(row, rows[target].nextSibling);
    }

    pp_saUpdatePreview();
    row.querySelector('.pp-sa-input').focus();
}

function checkSmartArtPopup(){
    _hidePopupError('pp_err_smartart');
    const a = window._ppAns || {};
    const expectedAns = a.ans || [];

    const editor = document.getElementById('pp_sa_editor');
    if(!editor){ return; }
    const inputs = editor.querySelectorAll('.pp-sa-input');
    const currentCount = inputs.length;

    let errors = [];

    // 1. Kiểm tra số lượng dòng
    if(currentCount !== expectedAns.length){
        errors.push('Số dòng yêu cầu: ' + expectedAns.length + ' (hiện tại: ' + currentCount + ')');
    }

    // 2. Kiểm tra nội dung từng dòng
    expectedAns.forEach(function(expectedTxt, i){
        if(inputs[i]){
            const val = inputs[i].value.trim();
            if(val !== expectedTxt){
                errors.push('Dòng ' + (i + 1) + '→"' + expectedTxt + '"');
            }
        }
    });

    if(errors.length){
        _showPopupError('pp_err_smartart', '❌ Chưa đúng! ' + errors.join(' | '));
        return;
    }

    closeMosPopup();
    if(typeof checkCorrect === 'function'){
        checkCorrect();
    } else if(typeof nextMosStep === 'function'){
        nextMosStep();
    }
}

/* ============================================================
   17. POPUP CAPTION //copy vào HTML, kiểm tra mặc định ok
  
   ============================================================
popupType: 'caption',
popupAnswer: {
     captionText: 'Figure 1',
     labelFigure:   true,
     labelTable:    false,
     labelEquation: false,
     posBelow: true,   
     posAbove: false,  
     excludeLabel: false }},
============================================================ */
function openCaptionPopup(step){
    const box = _createPopupShell('Caption');
    const ans = step.popupAnswer || {};

    const ansLabel = ans.labelFigure   ? 'Figure'
                   : ans.labelTable    ? 'Table'
                   : ans.labelEquation ? 'Equation' : '';
    const ansPos   = ans.posAbove ? 'Above selected item'
                                  : 'Below selected item';

    window._ppAns = {
        captionText:  ('captionText'  in ans) ? ans.captionText  : undefined,
        label:        ansLabel,
        position:     ansPos,
        excludeLabel: ('excludeLabel' in ans) ? ans.excludeLabel : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:320px;gap:8px;padding:12px 14px;';
    body.innerHTML = `
    <!-- Caption input -->
    <div>
        <label style="font-size:12px;display:block;margin-bottom:4px;">Caption:</label>
<input type="text" id="pp_captionText"
    style="width:100%;padding:5px 8px;border:1px solid #94a3b8;
           border-radius:3px;font-size:13px;box-sizing:border-box;
           background:#fff;"
    placeholder="Nhập caption...">
    </div>

    <!-- Options -->
    <div style="border:1px solid #e2e8f0;border-radius:4px;padding:8px 10px;">
        <div style="font-size:12px;font-weight:bold;color:#374151;
                    margin-bottom:6px;">Options</div>

        <!-- Label -->
        <div style="display:grid;grid-template-columns:60px 1fr;
                    gap:5px;align-items:center;margin-bottom:5px;">
            <label style="font-size:12px;color:#374151;">Label:</label>
            <select id="pp_label"
                style="font-size:12px;padding:3px 6px;border:1px solid #94a3b8;
                       border-radius:3px;background:#fff;"
                onchange="pp_captionUpdateText()">
                <option value="Figure">Figure</option>
                <option value="Table">Table</option>
                <option value="Equation">Equation</option>
            </select>
        </div>

        <!-- Position -->
        <div style="display:grid;grid-template-columns:60px 1fr;
                    gap:5px;align-items:center;">
            <label style="font-size:12px;color:#374151;">Position:</label>
            <select id="pp_position"
style="font-size:12px;padding:3px 6px;border:1px solid #94a3b8;
       border-radius:3px;background:#fff;color:#374151;">
                <option value="Below selected item">Below selected item</option>
                <option value="Above selected item">Above selected item</option>
            </select>
        </div>
    </div>

    <!-- Exclude label -->
    <div>
        <label style="display:flex;align-items:center;gap:8px;
                      font-size:12px;cursor:pointer;color:#374151;">
            <input type="checkbox" id="pp_excludeLabel"
                onchange="pp_captionUpdateText()">
            Exclude label from caption
        </label>
    </div>

    <!-- Nút hành động -->
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="pp-btn" style="font-size:12px;padding:4px 10px;">
            New Label...
        </button>
        <button class="pp-btn" style="font-size:12px;padding:4px 10px;
            color:#94a3b8;cursor:not-allowed;" disabled>
            Delete Label
        </button>
        <button class="pp-btn" style="font-size:12px;padding:4px 10px;">
            Numbering...
        </button>
    </div>

    <div class="pp-error" id="pp_err_caption"></div>

    <div style="display:flex;gap:6px;justify-content:space-between;
                border-top:1px solid #e2e8f0;padding-top:8px;">
        <button class="pp-btn" style="font-size:12px;padding:4px 10px;">
            AutoCaption...
        </button>
        <div style="display:flex;gap:6px;">
            <button class="pp-btn pp-btn-cancel"
                onclick="closeMosPopup()" style="font-size:12px;">Cancel</button>
            <button class="pp-btn pp-btn-ok"
                onclick="checkCaptionPopup()" style="font-size:12px;">OK</button>
        </div>
    </div>`;
    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

    /* Set giá trị mặc định theo ans */
    setTimeout(function(){
        const lblEl = document.getElementById('pp_label');
        const posEl = document.getElementById('pp_position');
if(lblEl) lblEl.value = 'Figure';
    if(posEl) posEl.value = 'Below selected item';
    /* Không pre-fill caption — học sinh tự nhập */
    }, 30);
}

/* ── Cập nhật gợi ý placeholder khi đổi Label hoặc Exclude — KHÔNG đụng vào
   giá trị học sinh đã nhập, để không phân biệt thứ tự nhập văn bản trước
   hay chọn Label/Exclude trước, tránh mất nội dung đã gõ. ── */
function pp_captionUpdateText(){
    const lblEl     = document.getElementById('pp_label');
    const excludeEl = document.getElementById('pp_excludeLabel');
    const capEl     = document.getElementById('pp_captionText');
    if(!lblEl||!capEl){return;}

    const label   = lblEl.value;
    const exclude = excludeEl ? excludeEl.checked : false;

    capEl.placeholder = exclude ? '1' : label + ' 1';
}

/* ── Hàm check ── */
function checkCaptionPopup(){
    _hidePopupError('pp_err_caption');
    const a = window._ppAns||{};

    const captionText  = (document.getElementById('pp_captionText') ||{}).value||'';
    const label        = (document.getElementById('pp_label')       ||{}).value||'';
    const position     = (document.getElementById('pp_position')    ||{}).value||'';
    const excludeLabel = (document.getElementById('pp_excludeLabel')||{}).checked||false;

    let errors=[];
    if(a.captionText !==undefined && captionText.trim()!==a.captionText)
        errors.push('Caption→"'+a.captionText+'"');
    if(a.label       && label!==a.label)
        errors.push('Label→'+a.label);
    if(a.position    && position!==a.position)
        errors.push('Position→'+a.position);
    if(a.excludeLabel!==undefined && excludeLabel!==a.excludeLabel)
        errors.push('ExcludeLabel→'+a.excludeLabel);

    if(errors.length){
        _showPopupError('pp_err_caption','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   18. POPUP DOCUMENT INSPECTOR //mặc định đánh dấu hết, câu hỏi yêu cầu cái nào thì giữ nguyên cái đó//
//copy vào HTML
   ============================================================
popupType: 'doc-inspect',
popupAnswer: {
     	comments:           false,
     	revisions:          false,
     	documentProps:      false,
     	customXmlData:      true,
     	headers:            false,
     	invisibleContent:   false,
     	hiddenText:         false,
     	watermarks:         false,
     	macros:             false,
     	collapsedHeadings:  false  }},
============================================================ */
function openDocInspectPopup(step){
    const box = _createPopupShell('Document Inspector');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        comments:          ('comments'          in ans)?ans.comments          :undefined,
        revisions:         ('revisions'         in ans)?ans.revisions         :undefined,
        documentProps:     ('documentProps'     in ans)?ans.documentProps     :undefined,
        customXmlData:     ('customXmlData'     in ans)?ans.customXmlData     :undefined,
        headers:           ('headers'           in ans)?ans.headers           :undefined,
        invisibleContent:  ('invisibleContent'  in ans)?ans.invisibleContent  :undefined,
        hiddenText:        ('hiddenText'        in ans)?ans.hiddenText        :undefined,
        watermarks:        ('watermarks'        in ans)?ans.watermarks        :undefined,
        macros:            ('macros'            in ans)?ans.macros            :undefined,
        collapsedHeadings: ('collapsedHeadings' in ans)?ans.collapsedHeadings :undefined,
    };

    const items = [
        { id:'pp_ins_comments',         label:'Comments, Revisions, Versions, and Annotations',
          desc:'Inspects the document for comments, revisions, version information, and ink annotations.' },
        { id:'pp_ins_docProps',         label:'Document Properties and Personal Information',
          desc:'Inspects for hidden metadata or personal information saved with the document.' },
        { id:'pp_ins_taskPanes',        label:'Task Pane Add-ins',
          desc:'Inspects for Task Pane add-ins saved in the document.' },
        { id:'pp_ins_embedded',         label:'Embedded Documents',
          desc:'Inspects for embedded documents, which may include information not visible in the document.' },
        { id:'pp_ins_macros',           label:'Macros, Forms, and ActiveX Controls',
          desc:'Inspects for macros, forms, and ActiveX controls.' },
        { id:'pp_ins_links',            label:'Linked Objects and Files',
          desc:'Inspects for objects that are linked to other files outside the document.' },
        { id:'pp_ins_collapsed',        label:'Collapsed Headings',
          desc:'Inspects the document for text that has been collapsed under a heading.' },
        { id:'pp_ins_customXml',        label:'Custom XML Data',
          desc:'Inspects for custom XML data stored with this document.' },
        { id:'pp_ins_headers',          label:'Headers, Footers, and Watermarks',
          desc:'Inspects the document for information in headers, footers, and watermarks.' },
        { id:'pp_ins_hidden',           label:'Hidden Text',
          desc:'Inspects the document for text formatted as hidden.' },
        { id:'pp_ins_invisible',        label:'Invisible Content',
          desc:'Inspects the document for objects that are not visible because they have been formatted as invisible.' },
    ];

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:420px;max-width:520px;gap:0;padding:0;';

    /* Tiêu đề hướng dẫn */
    const intro = document.createElement('div');
    intro.style.cssText = 'font-size:14px;color:#374151;padding:10px 14px 6px;border-bottom:1px solid #e2e8f0;';
    intro.textContent   = 'Select the content you want to inspect before clicking Inspect.';
    body.appendChild(intro);

    /* Danh sách checkbox có scroll */
    const list = document.createElement('div');
    list.style.cssText  = 'max-height:200px;overflow-y:auto;padding:2px 0;';

    items.forEach(function(item){
        const row = document.createElement('div');
        row.style.cssText = 'padding:2px 14px;border-bottom:0.5px solid #f1f5f9;cursor:pointer;';
        row.innerHTML = `
            <label style="display:flex;align-items:flex-start;gap:2px;cursor:pointer;">
                <input type="checkbox" id="${item.id}" checked
                    style="margin-top:2px;flex-shrink:0;cursor:pointer;width:14px;height:14px;">
                <div>
                    <div style="font-size:14px;font-weight:bold;color:#1e3a5f;line-height:1.4;">
                        ${item.label}
                    </div>
                    <div style="font-size:14px;color:#64748b;margin-top:0px;line-height:1.4;">
                        ${item.desc}
                    </div>
                </div>
            </label>`;
        /* Hover */
        row.addEventListener('mouseenter', function(){ row.style.background='#f0f7ff'; });
        row.addEventListener('mouseleave', function(){ row.style.background=''; });
        list.appendChild(row);
    });
    body.appendChild(list);

    /* Error + nút */
    const errDiv = document.createElement('div');
    errDiv.className   = 'pp-error';
    errDiv.id          = 'pp_err_inspect';
    errDiv.style.margin= '0 14px';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:8px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Close</button>
        <button class="pp-btn pp-btn-ok" onclick="checkDocInspectPopup()">Inspect</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
}

function checkDocInspectPopup(){
    _hidePopupError('pp_err_inspect');
    const a = window._ppAns||{};

    /* Map field name → checkbox id */
    const fieldMap = {
        comments:          'pp_ins_comments',
        documentProps:     'pp_ins_docProps',
        macros:            'pp_ins_macros',
        collapsedHeadings: 'pp_ins_collapsed',
        customXmlData:     'pp_ins_customXml',
        headers:           'pp_ins_headers',
        hiddenText:        'pp_ins_hidden',
        invisibleContent:  'pp_ins_invisible',
    };

    /* Map checkbox id → item label (để tìm đúng row cần thêm Remove all) */
    const idToLabel = {
        'pp_ins_comments':  'Comments, Revisions, Versions, and Annotations',
        'pp_ins_docProps':  'Document Properties and Personal Information',
        'pp_ins_macros':    'Macros, Forms, and ActiveX Controls',
        'pp_ins_collapsed': 'Collapsed Headings',
        'pp_ins_customXml': 'Custom XML Data',
        'pp_ins_headers':   'Headers, Footers, and Watermarks',
        'pp_ins_hidden':    'Hidden Text',
        'pp_ins_invisible': 'Invisible Content',
    };

    let errors=[];
    Object.keys(fieldMap).forEach(function(field){
        if(a[field]!==undefined){
            const el = document.getElementById(fieldMap[field]);
            const val= el ? el.checked : false;
            if(val!==a[field])
                errors.push(field+'→'+a[field]);
        }
    });

    if(errors.length){
        _showPopupError('pp_err_inspect','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }

    /* ── Đúng → đổi nút Inspect thành "Reinspect", hiện Remove all cho mỗi mục đã CHECK ── */
    /* Đổi nút Inspect thành Reinspect */
    const inspectBtn = document.querySelector('.pp-btn-ok');
    if(inspectBtn){ inspectBtn.textContent = 'Reinspect'; }

    /* Thêm "Remove all" vào từng row có checkbox đang CHECKED */
    Object.keys(fieldMap).forEach(function(field){
        const cbId = fieldMap[field];
        const cb = document.getElementById(cbId);
        if(!cb || !cb.checked){ return; } /* bỏ qua mục không check */
        if(document.getElementById(cbId+'_removeBtn')){ return; } /* tránh thêm 2 lần */

        /* Tìm đúng row chứa checkbox này */
        const row = cb.closest('div[style*="padding:2px 14px"]') || cb.parentElement.parentElement.parentElement;

        /* Tạo khu vực kết quả Inspect giống Word: icon ✔ + text + nút Remove all */
        const resultDiv = document.createElement('div');
        resultDiv.style.cssText = 'display:flex;align-items:center;justify-content:space-between;'
            +'padding:4px 0 4px 20px;gap:8px;';

        const infoSpan = document.createElement('span');
        infoSpan.style.cssText = 'font-size:13px;color:#16a34a;display:flex;align-items:center;gap:4px;';
        infoSpan.innerHTML = '&#10003; The following items were found:';

        const removeBtn = document.createElement('button');
        removeBtn.id = cbId + '_removeBtn';
        removeBtn.textContent = 'Remove All';
        removeBtn.style.cssText = 'font-size:12px;padding:3px 10px;background:#2563eb;color:#fff;'
            +'border:none;border-radius:4px;cursor:pointer;white-space:nowrap;flex-shrink:0;';

        /* Click Remove all → nút biến mất, gọi checkCorrect hoàn thành câu hỏi */
        removeBtn.addEventListener('click', function(){
            resultDiv.remove();
            closeMosPopup();
            checkCorrect();
        });

        resultDiv.appendChild(infoSpan);
        resultDiv.appendChild(removeBtn);
        row.appendChild(resultDiv);
    });
}

/* ============================================================
   19. POPUP BOOKMARK
   popupType: 'bookmark' (copy vào HTML)
   ============================================================
popupType:   'bookmark',
popupAnswer: {
     	bookmarkName: 'Details',  
     	sortByName:   true,            
     	sortByLocation: false,         
     	showHidden:   false,           
     	action:       'add', 
    	existingBookmarks: ['Bookmark1', 'Bookmark2'] }},
============================================================ */
function openBookmarkPopup(step){
    const box = _createPopupShell('Bookmark');
    const ans = step.popupAnswer || {};

    const ansSortBy = ans.sortByLocation ? 'Location' : 'Name';
    const ansAction = ans.action || 'add';

window._ppAns = {
    bookmarkName: ('bookmarkName' in ans) ? ans.bookmarkName : undefined,
    sortBy:       ansSortBy,
    showHidden:   ('showHidden'   in ans) ? ans.showHidden   : undefined,
    action:       ansAction,
};
/* Lưu danh sách bookmark ban đầu */
window._ppBookmarks = (ans.existingBookmarks || []).slice();

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:300px;gap:8px;padding:12px 14px;';
    body.innerHTML = `
    <!-- Tên bookmark -->
    <div>
        <label style="font-size:12px;display:block;margin-bottom:4px;">
            Bookmark name:
        </label>
        <input type="text" id="pp_bookmarkName" value=""
            placeholder="Nhập tên bookmark..."
            style="width:100%;padding:5px 8px;border:1px solid #94a3b8;
                   border-radius:3px;font-size:13px;box-sizing:border-box;background:#fff;">
    </div>

    <!-- Sort by -->
    <div>
        <label style="font-size:12px;display:block;margin-bottom:4px;">Sort by:</label>
        <div style="display:flex;gap:16px;">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_sortBy" id="pp_sortName" value="Name" checked>
                Name
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_sortBy" id="pp_sortLocation" value="Location">
                Location
            </label>
        </div>
    </div>

    <!-- Show hidden -->
    <div>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;">
            <input type="checkbox" id="pp_showHidden">
            Show hidden bookmarks
        </label>
    </div>

<!-- Danh sách bookmark thực tế -->
<div id="pp_bmList" style="border:1px solid #94a3b8;border-radius:3px;
    background:#fff;height:90px;overflow-y:auto;padding:4px;">
</div>

    <div class="pp-error" id="pp_err_bookmark"></div>

    <!-- Nút -->
    <div style="display:flex;gap:6px;justify-content:space-between;
                border-top:1px solid #e2e8f0;padding-top:8px;">
        <div style="display:flex;gap:6px;">
            <button class="pp-btn pp-btn-ok"
                onclick="pp_bookmarkAction('add')"
                style="font-size:12px;padding:4px 14px;">Add</button>
            <button class="pp-btn"
                onclick="pp_bookmarkAction('delete')"
                style="font-size:12px;padding:4px 14px;color:#dc2626;">Delete</button>
            <button class="pp-btn"
                onclick="pp_bookmarkAction('goTo')"
                style="font-size:12px;padding:4px 14px;">Go To</button>
        </div>
        <button class="pp-btn pp-btn-cancel"
            onclick="closeMosPopup()"
            style="font-size:12px;">Cancel</button>
    </div>`;
box.appendChild(body);
    /* Render danh sách bookmark ban đầu */
    pp_bmRenderList();
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

}

function pp_bookmarkAction(action){
    window._ppBookmarkAction = action;

    const nameEl = document.getElementById('pp_bookmarkName');
    const name   = nameEl ? nameEl.value.trim() : '';
    const list   = document.getElementById('pp_bmList');

if(action === 'add'){
        _hidePopupError('pp_err_bookmark');
        if(!name){
            _showPopupError('pp_err_bookmark','⚠️ Nhập tên bookmark trước khi Add.');
            return;
        }
        /* Kiểm tra đúng tên yêu cầu */
        const a = window._ppAns||{};
        if(a.bookmarkName !== undefined && name !== a.bookmarkName){
            _showPopupError('pp_err_bookmark',
                '❌ Chưa đúng! Bookmark name→"'+a.bookmarkName+'"');
            return;
        }
/* Đúng → thêm vào danh sách, đóng popup, chấm điểm */
        if(!window._ppBookmarks.includes(name)){
            window._ppBookmarks.push(name);
        }
        closeMosPopup();
        checkCorrect();
        return;
    }

    if(action === 'delete'){
        /* Xóa bookmark đang chọn khỏi danh sách */
        const selected = document.querySelector('.pp-bm-item.selected');
        if(selected){
            const idx = parseInt(selected.dataset.idx);
            window._ppBookmarks.splice(idx, 1);
            pp_bmRenderList();
        } else {
            _showPopupError('pp_err_bookmark','⚠️ Chọn bookmark cần xóa trước.');
        }
        return; /* Không đóng popup */
    }

    /* goTo hoặc OK → check và đóng */
    checkBookmarkPopup();
}

/* Render danh sách bookmark */
function pp_bmRenderList(){
    const list = document.getElementById('pp_bmList');
    if(!list){return;}
    if(window._ppBookmarks.length === 0){
        list.innerHTML = '<div style="font-size:11px;color:#94a3b8;'
            +'text-align:center;margin-top:28px;">— Chưa có bookmark —</div>';
        return;
    }
    list.innerHTML = window._ppBookmarks.map(function(bm, i){
        return '<div class="pp-bm-item" data-idx="'+i+'"'
            +' onclick="pp_bmSelect(this)"'
            +' style="padding:3px 8px;font-size:12px;cursor:pointer;'
            +'border-radius:3px;user-select:none;">'+bm+'</div>';
    }).join('');
}

/* Chọn bookmark trong danh sách */
function pp_bmSelect(el){
    document.querySelectorAll('.pp-bm-item').forEach(function(item){
        item.style.background = '';
        item.classList.remove('selected');
    });
    el.style.background = '#dbeafe';
    el.classList.add('selected');
    /* Điền tên vào ô input */
    const nameEl = document.getElementById('pp_bookmarkName');
    if(nameEl){ nameEl.value = el.textContent; }
}

function checkBookmarkPopup(){
    _hidePopupError('pp_err_bookmark');
    const a      = window._ppAns||{};
    const name   = (document.getElementById('pp_bookmarkName')||{}).value||'';
    const sortEl = document.querySelector('input[name="pp_sortBy"]:checked');
    const sortBy = sortEl ? sortEl.value : '';
    const hidden = (document.getElementById('pp_showHidden')||{}).checked||false;
    const action = window._ppBookmarkAction||'';

    let errors=[];
    if(a.bookmarkName!==undefined && name.trim()!==a.bookmarkName)
        errors.push('Bookmark name→"'+a.bookmarkName+'"');
    if(a.sortBy && sortBy!==a.sortBy)
        errors.push('Sort by→'+a.sortBy);
    if(a.showHidden!==undefined && hidden!==a.showHidden)
        errors.push('Show hidden→'+a.showHidden);
    if(a.action && action!==a.action)
        errors.push('Action→'+a.action+' (nhấn đúng nút)');

    if(errors.length){
        _showPopupError('pp_err_bookmark','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }
    closeMosPopup(); checkCorrect();
}


/* ============================================================
   20. POPUP PRINTED WATERMARK
   popupType: 'watermark'  //copy vào HTML
   ============================================================
popupType: 'watermark',
popupAnswer: {
    	textWatermark:  true,
    	text:           'Economy',
    	fontArial:      true,
    	fontDefault:    'Times New Roman', 
    	colorDarkBlue:  true,
    	colorDefault:   'Automatic',       
    	semitransparent:true,
    	layoutHorizontal:false }},
============================================================ */
function openWatermarkPopup(step){
    const box = _createPopupShell('Printed Watermark');
    const ans = step.popupAnswer || {};

    /* Giải mã loại — dùng để CHẤM ĐIỂM, không dùng để hiển thị ban đầu */
    const wType = ans.pictureWatermark ? 'picture'
                : ans.noWatermark      ? 'none'
                : 'text';
    /* Giá trị hiển thị mặc định khi MỞ popup — CỐ ĐỊNH, không đọc từ ans */
    const DISPLAY_WTYPE = 'none';

    const ansFont  = ans.fontArial          ? 'Arial'
                   : ans.fontCalibri        ? 'Calibri'
                   : ans.fontTimesNewRoman  ? 'Times New Roman'
                   : 'Times New Roman';

    const ansSize  = ans.size12 ? '12'
                   : ans.size16 ? '16'
                   : ans.size24 ? '24'
                   : ans.size36 ? '36'
                   : 'Auto';

    const ansColor = ans.colorRed  ? 'Red'
                   : ans.colorBlue ? 'Blue'
	: ans.colorDarkBlue ? 'Dark Blue'
                   : 'Automatic';

    const ansPicScale = ans.pictureScale || 'Auto';

    window._ppAns = {
        wType:         wType,
        /* Picture */
        pictureScale:  ('pictureScale'  in ans) ? ans.pictureScale  : undefined,
        washout:       ('washout'       in ans) ? ans.washout       : undefined,
        /* Text */
text:        ('text'        in ans) ? ans.text        : undefined,
textDefault: ('textDefault' in ans) ? ans.textDefault : undefined,
        font:          ansFont,
fontDefault: ('fontDefault'  in ans) ? ans.fontDefault  : undefined,
        size:          ansSize,
        color:         ansColor,
colorDefault: ('colorDefault' in ans) ? ans.colorDefault : undefined,
        semitransparent:('semitransparent' in ans)?ans.semitransparent:undefined,
        layout:        ans.layoutHorizontal ? 'Horizontal' : 'Diagonal',
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:500px;gap:6px;padding:12px 14px;';
    body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:12px;align-items:start;">

      <!-- ===== CỘT TRÁI: No watermark + Picture watermark ===== -->
      <div style="display:flex;flex-direction:column;gap:6px;">

        <!-- No watermark -->
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;">
            <input type="radio" name="pp_wType" value="none"
                ${DISPLAY_WTYPE==='none'?'checked':''}
                onchange="pp_wToggle()">
            No watermark
        </label>

        <!-- Picture watermark -->
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;">
            <input type="radio" name="pp_wType" value="picture"
                ${DISPLAY_WTYPE==='picture'?'checked':''}
                onchange="pp_wToggle()">
            Picture watermark
        </label>

        <!-- Picture section -->
        <div id="pp_w_picSection"
            style="margin-left:20px;display:flex;flex-direction:column;gap:5px;
                   border:1px solid #e2e8f0;border-radius:4px;padding:8px;
                   opacity:${DISPLAY_WTYPE==='picture'?'1':'0.4'};
                   pointer-events:${DISPLAY_WTYPE==='picture'?'auto':'none'};">
            <button class="pp-btn" style="font-size:12px;padding:3px 12px;width:120px;">
                Select Picture...
            </button>
            <div style="display:grid;grid-template-columns:50px 1fr;gap:5px;align-items:center;">
                <label style="font-size:12px;">Scale:</label>
                <select id="pp_picScale" style="font-size:12px;padding:3px 6px;">
                    <option value="Auto">Auto</option>
                    <option value="50%">50%</option>
                    <option value="100%">100%</option>
                    <option value="150%">150%</option>
                    <option value="200%">200%</option>
                </select>
            </div>
            <label style="display:flex;align-items:center;gap:5px;font-size:12px;">
                <input type="checkbox" id="pp_washout" checked>
                Washout
            </label>
        </div>

      </div>

      <!-- ===== CỘT PHẢI: Text watermark ===== -->
      <div style="display:flex;flex-direction:column;gap:6px;">

        <!-- Text watermark radio -->
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;">
            <input type="radio" name="pp_wType" value="text"
                ${DISPLAY_WTYPE==='text'?'checked':''}
                onchange="pp_wToggle()">
            Text watermark
        </label>

        <!-- Text section -->
        <div id="pp_w_txtSection"
            style="margin-left:20px;display:flex;flex-direction:column;gap:5px;
                   border:1px solid #e2e8f0;border-radius:4px;padding:8px;
                   opacity:${DISPLAY_WTYPE==='text'?'1':'0.4'};
                   pointer-events:${DISPLAY_WTYPE==='text'?'auto':'none'};">

            <!-- Language -->
            <div style="display:grid;grid-template-columns:60px 1fr;gap:4px;align-items:center;">
                <label style="font-size:12px;">Language:</label>
                <select id="pp_wLang" style="font-size:12px;padding:3px 6px;">
                    <option value="English (United States)">English (United States)</option>
                    <option value="Vietnamese">Vietnamese</option>
                </select>
            </div>

<!-- Text -->
            <div style="display:grid;grid-template-columns:60px 1fr;gap:4px;align-items:center;">
                <label style="font-size:12px;">Text:</label>
                <div style="display:flex;flex-direction:column;gap:3px;">
                    <select id="pp_wTextSelect"
                        style="font-size:12px;padding:3px 6px;"
                        onchange="pp_wTextSelectChange()">
                        <option value="">-- Chọn nhanh --</option>
                        <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                        <option value="DO NOT COPY">DO NOT COPY</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="ASAP">ASAP</option>
                        <option value="SAMPLE">SAMPLE</option>
                        <option value="URGENT">URGENT</option>
	 <option value="Economy">Economy</option>
                    </select>
                    <input type="text" id="pp_wText"
                        placeholder="Hoặc nhập text theo câu hỏi..."
                        style="font-size:12px;padding:3px 6px;
                               border:1px solid #94a3b8;border-radius:3px;">
                </div>
            </div>

            <!-- Font -->
            <div style="display:grid;grid-template-columns:60px 1fr;gap:4px;align-items:center;">
                <label style="font-size:12px;">Font:</label>
                <select id="pp_wFont" style="font-size:12px;padding:3px 6px;">
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Calibri">Calibri</option>
                </select>
            </div>
            <!-- Size -->
            <div style="display:grid;grid-template-columns:60px 1fr;gap:4px;align-items:center;">
                <label style="font-size:12px;">Size:</label>
                <select id="pp_wSize" style="font-size:12px;padding:3px 6px;">
                    <option value="Auto">Auto</option>
                    <option value="12">12</option>
                    <option value="16">16</option>
                    <option value="24">24</option>
                    <option value="36">36</option>
                </select>
            </div>
            <!-- Color + Semitransparent -->
            <div style="display:grid;grid-template-columns:60px 1fr;gap:4px;align-items:center;">
                <label style="font-size:12px;">Color:</label>
                <select id="pp_wColor" style="font-size:12px;padding:3px 6px;">
                    <option value="Automatic">Automatic</option>
                    <option value="Red">Red</option>
                    <option value="Blue">Blue</option>
	<option value="Dark Blue">Dark Blue</option>
                </select>
            </div>

            <label style="display:flex;align-items:center;gap:5px;font-size:12px;margin-left:64px;">
                <input type="checkbox" id="pp_semitrans" checked>
                Semitransparent
            </label>
            <!-- Layout -->
            <div style="display:grid;grid-template-columns:60px 1fr;gap:4px;align-items:center;">
                <label style="font-size:12px;">Layout:</label>
                <div style="display:flex;gap:12px;">
                    <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;">
                        <input type="radio" name="pp_wLayout" id="pp_layoutDiag" value="Diagonal" checked>
                        Diagonal
                    </label>
                    <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;">
                        <input type="radio" name="pp_wLayout" id="pp_layoutHoriz" value="Horizontal">
                        Horizontal
                    </label>
                </div>
            </div>
        </div>

      </div>
    </div>

    <div class="pp-error" id="pp_err_watermark"></div>

    <!-- Nút -->
    <div style="display:flex;gap:6px;justify-content:flex-end;
                border-top:1px solid #e2e8f0;padding-top:8px;">
        <button class="pp-btn"
            onclick="pp_wApply()"
            style="font-size:12px;padding:4px 14px;">Apply</button>
        <button class="pp-btn pp-btn-ok"
            onclick="checkWatermarkPopup()"
            style="font-size:12px;padding:4px 14px;">OK</button>
        <button class="pp-btn pp-btn-cancel"
            onclick="closeMosPopup()"
            style="font-size:12px;">Cancel</button>
    </div>`;
    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

    /* Set giá trị mặc định theo ans */
    setTimeout(function(){
        const fontEl  = document.getElementById('pp_wFont');
        const sizeEl  = document.getElementById('pp_wSize');
        const colorEl = document.getElementById('pp_wColor');
        const textEl  = document.getElementById('pp_wText');
        const scaleEl = document.getElementById('pp_picScale');
if(fontEl)  fontEl.value  = 'Times New Roman';
        if(sizeEl)  sizeEl.value  = 'Auto';
if(colorEl) colorEl.value = 'Automatic';
if(textEl) textEl.value = '';
        if(scaleEl) scaleEl.value = 'Auto';
        /* Layout, Washout, Semitransparent giữ nguyên mặc định gốc trong HTML
           (Diagonal / Washout bật / Semitransparent bật) — không đọc từ ans */
    }, 30);
}

/* Toggle enable/disable các section */
function pp_wToggle(){
    const typeEl = document.querySelector('input[name="pp_wType"]:checked');
    if(!typeEl){return;}
    const t = typeEl.value;
    const picSec = document.getElementById('pp_w_picSection');
    const txtSec = document.getElementById('pp_w_txtSection');
    if(picSec){
        picSec.style.opacity       = (t==='picture')?'1':'0.4';
        picSec.style.pointerEvents = (t==='picture')?'auto':'none';
    }
    if(txtSec){
        txtSec.style.opacity       = (t==='text')?'1':'0.4';
        txtSec.style.pointerEvents = (t==='text')?'auto':'none';
    }
}

/* Apply (không check — chỉ visual) */
function pp_wApply(){ /* placeholder */ }

/* Khi chọn từ dropdown → điền vào ô nhập */
function pp_wTextSelectChange(){
    const sel = document.getElementById('pp_wTextSelect');
    const inp = document.getElementById('pp_wText');
    if(!sel||!inp){return;}
    if(sel.value){ inp.value = sel.value; }
}

function checkWatermarkPopup(){
    _hidePopupError('pp_err_watermark');
    const a = window._ppAns||{};

    const typeEl = document.querySelector('input[name="pp_wType"]:checked');
    const wType  = typeEl ? typeEl.value : '';

    let errors=[];

    /* Kiểm tra loại watermark */
    if(a.wType && wType!==a.wType)
        errors.push('Loại→'+(a.wType==='text'?'Text watermark':a.wType==='picture'?'Picture watermark':'No watermark'));

    if(wType==='picture'){
        const scale   = (document.getElementById('pp_picScale')||{}).value||'';
        const washout = (document.getElementById('pp_washout') ||{}).checked||false;
        if(a.pictureScale!==undefined && scale!==a.pictureScale) errors.push('Scale→'+a.pictureScale);
        if(a.washout     !==undefined && washout!==a.washout)    errors.push('Washout→'+a.washout);
    }

    if(wType==='text'){
        const text    = (document.getElementById('pp_wText')   ||{}).value||'';
        const font    = (document.getElementById('pp_wFont')   ||{}).value||'';
        const size    = (document.getElementById('pp_wSize')   ||{}).value||'';
        const color   = (document.getElementById('pp_wColor')  ||{}).value||'';
        const semiEl  = document.getElementById('pp_semitrans');
        const semi    = semiEl ? semiEl.checked : false;
        const layEl   = document.querySelector('input[name="pp_wLayout"]:checked');
        const layout  = layEl ? layEl.value : '';

        if(a.text          !==undefined && text  !==a.text)          errors.push('Text→"'+a.text+'"');
        if(a.font          && font  !==a.font)                        errors.push('Font→'+a.font);
        if(a.size          && size  !==a.size)                        errors.push('Size→'+a.size);
        if(a.color         && color !==a.color)                       errors.push('Color→'+a.color);
        if(a.semitransparent!==undefined && semi!==a.semitransparent) errors.push('Semitransparent→'+a.semitransparent);
        if(a.layout        && layout!==a.layout)                      errors.push('Layout→'+a.layout);
    }

    if(errors.length){
        _showPopupError('pp_err_watermark','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }
    closeMosPopup(); checkCorrect();
}


/* ============================================================
   21. POPUP 1: ZOOM //đoạn copy HTML
popupType: 'zoom',
popupAnswer: {
zoom100:   false,
zoomCustom:true, 
percent: 98   }},
   ============================================================
   popupAnswer: {
     // Zoom preset — chỉ 1 cái true
     zoom200:   false,
     zoom100:   false,
     zoom75:    false,
     zoom50:    false,
     zoom25:    false,
     zoomWhole: false,   // Whole page
     zoomWidth: false,   // Page width
     zoomText:  false,   // Text width
     zoomMany:  false,   // Many pages
     zoomCustom:true,    // Percent — nhập tay

     // Nếu zoomCustom:true → giá trị phần trăm
     percent: 120,

     // Monitor
     monitorCurrent: true,
     monitorAll:     false,
   }
============================================================ */
function openZoomPopup(step){
    const box = _createPopupShell('Zoom');
    const ans = step.popupAnswer || {};

    const ansPreset =
          ans.zoom200   ? '200'
        : ans.zoom100   ? '100'
        : ans.zoom75    ? '75'
        : ans.zoom50    ? '50'
        : ans.zoom25    ? '25'
        : ans.zoomWhole ? 'whole'
        : ans.zoomWidth ? 'width'
        : ans.zoomText  ? 'text'
        : ans.zoomMany  ? 'many'
        : 'custom';

const ansPercent        = ('percent'        in ans) ? ans.percent        : undefined;
const ansPercentDefault = ('percentDefault' in ans) ? ans.percentDefault : 100;
    const ansMonitor = ans.monitorAll ? 'all' : 'current';

    window._ppAns = {
        preset:  ansPreset,
        percent: ansPercent,
        monitor: ansMonitor,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:340px;gap:8px;padding:12px 14px;';
    body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;">

      <!-- CỘT TRÁI: Zoom to -->
      <div>
        <div class="pp-group-title" style="margin-top:0;margin-bottom:6px;">Zoom to</div>
        <div style="display:flex;flex-direction:column;gap:8px;">

            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_zoom" value="200"
                    onchange="pp_zoomToggle()"> 200%
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_zoom" value="100"
                    onchange="pp_zoomToggle()"> 100%
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_zoom" value="75"
                    onchange="pp_zoomToggle()"> 75%
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_zoom" value="50"
                    onchange="pp_zoomToggle()"> 50%
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_zoom" value="25"
                    onchange="pp_zoomToggle()"> 25%
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_zoom" value="whole"
                    onchange="pp_zoomToggle()"> Whole page
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_zoom" value="width"
                    onchange="pp_zoomToggle()"> Page width
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_zoom" value="text"
                    onchange="pp_zoomToggle()"> Text width
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="radio" name="pp_zoom" value="many"
                    onchange="pp_zoomToggle()"> Many pages
            </label>

            <!-- Custom percent -->
            <div style="display:flex;align-items:center;gap:6px;">
                <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                    <input type="radio" name="pp_zoom" value="custom"
                        onchange="pp_zoomToggle()"> Percent:
                </label>
                <input type="number" id="pp_zoomPercent"
                    min="10" max="500" value="100"
                    style="width:58px;font-size:12px;padding:3px 5px;
                           border:1px solid #94a3b8;border-radius:3px;"
                    disabled class="pp-disabled">
                <span style="font-size:12px;">%</span>
            </div>
        </div>
      </div>

      <!-- CỘT PHẢI: Preview + Monitor -->
      <div style="display:flex;flex-direction:column;gap:10px;">

        <!-- Preview trang -->
        <div>
            <div class="pp-group-title" style="margin-top:0;margin-bottom:6px;">Preview</div>
            <div id="pp_zoomPreview"
                style="border:1px solid #94a3b8;border-radius:3px;
                       background:#f8fafc;height:80px;
                       display:flex;align-items:center;justify-content:center;
                       position:relative;overflow:hidden;">
                <div style="border:1px solid #cbd5e1;background:#fff;
                            width:40px;height:55px;border-radius:1px;
                            box-shadow:1px 1px 3px rgba(0,0,0,0.1);
                            display:flex;flex-direction:column;gap:2px;
                            padding:4px;">
                    <div style="height:2px;background:#e5e7eb;border-radius:1px;"></div>
                    <div style="height:2px;background:#e5e7eb;border-radius:1px;"></div>
                    <div style="height:2px;background:#e5e7eb;border-radius:1px;"></div>
                    <div style="height:2px;background:#e5e7eb;border-radius:1px;width:60%;"></div>
                </div>
                <div id="pp_zoomLabel"
                    style="position:absolute;bottom:4px;right:6px;
                           font-size:10px;color:#64748b;font-weight:bold;">100%</div>
            </div>
        </div>

        <!-- Monitor -->
        <div>
            <div class="pp-group-title" style="margin-bottom:6px;">Monitor</div>
            <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                    <input type="radio" name="pp_monitor" value="current" checked>
                    Current monitor
                </label>
                <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                    <input type="radio" name="pp_monitor" value="all">
                    All monitors
                </label>
            </div>
        </div>

      </div>
    </div>

    <div class="pp-error" id="pp_err_zoom"></div>
    <div class="pp-btn-row">
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkZoomPopup()">OK</button>
    </div>`;
    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

    /* Set giá trị hiển thị mặc định — CỐ ĐỊNH, không đọc từ ans (tránh lộ đáp án) */
    setTimeout(function(){
        const DISPLAY_PRESET  = '100';
        const DISPLAY_MONITOR = 'current';
        const radios = document.querySelectorAll('input[name="pp_zoom"]');
        radios.forEach(function(r){ if(r.value===DISPLAY_PRESET) r.checked=true; });
        document.getElementById('pp_zoomPercent').value = 100;
        const monRadios = document.querySelectorAll('input[name="pp_monitor"]');
        monRadios.forEach(function(r){ if(r.value===DISPLAY_MONITOR) r.checked=true; });
        pp_zoomToggle();
    }, 30);
}

function pp_zoomToggle(){
    const checked = document.querySelector('input[name="pp_zoom"]:checked');
    const pctEl   = document.getElementById('pp_zoomPercent');
    const lbl     = document.getElementById('pp_zoomLabel');
    if(!checked||!pctEl){return;}

    const isCustom = (checked.value==='custom');
    pctEl.disabled  = !isCustom;
    pctEl.className = isCustom ? '' : 'pp-disabled';

    /* Cập nhật label preview */
    const pctMap = {'200':'200%','100':'100%','75':'75%','50':'50%','25':'25%',
                    'whole':'Whole','width':'Width','text':'Text','many':'Many'};
    if(lbl){
        lbl.textContent = isCustom
            ? (pctEl.value||'100')+'%'
            : (pctMap[checked.value]||checked.value);
    }
    if(isCustom){
        pctEl.addEventListener('input', function(){
            if(lbl) lbl.textContent = (pctEl.value||'100')+'%';
        });
    }
}

function checkZoomPopup(){
    _hidePopupError('pp_err_zoom');
    const a       = window._ppAns||{};
    const checked = document.querySelector('input[name="pp_zoom"]:checked');
    const preset  = checked ? checked.value : '';
    const pctEl   = document.getElementById('pp_zoomPercent');
    const percent = parseInt(pctEl&&!pctEl.disabled ? pctEl.value : 0)||0;
    const monEl   = document.querySelector('input[name="pp_monitor"]:checked');
    const monitor = monEl ? monEl.value : '';

    let errors=[];
    if(a.preset  && preset  !==a.preset)  errors.push('Zoom→'+a.preset);
    if(a.percent !==undefined && preset==='custom' && percent!==a.percent)
        errors.push('Percent→'+a.percent+'%');
    if(a.monitor && monitor !==a.monitor) errors.push('Monitor→'+a.monitor);

    if(errors.length){_showPopupError('pp_err_zoom','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   22. FORMAT PICTURE & TABLE — ALT TEXT //copy vào HTML
popupType: 'alt-text',
popupAnswer:{
    	iconFill:false,
    	iconEffects:false,
    	iconLayout:false,
   	iconPicture:false,
   	iconTable:true,      
    	title:       'Company',
    	description: 'Logo' } },
    iconTable:true,      // ← MỚI: icon Alt Text_Table
   ============================================================
 popupType: 'alt-text',  
 popupAnswer: {
     // Icon được chọn — chỉ 1 cái true (phải chọn đúng icon Alt Text)
     iconFill:    false,   // 🔶 Fill (icon 1 - sai)
     iconEffects: false,   // 🔷 Effects (icon 2 - sai)
     iconLayout:  false,   // 📐 Layout (icon 3 - sai)
     iconPicture: true,    // 🖼 Picture (icon 4 - đúng cho hình ảnh)
     iconTable:   false,   // 🔳 Alt Text_Table (icon 5 - đúng cho bảng)

     // Nội dung sau khi chọn đúng icon (dùng chung cho cả Picture & Table)
     title:       'Company',
     description: 'Logo',
   }
============================================================ */
function openAltTextPopup(step){
    const box = _createPopupShell('Format Picture hoặc Table');
    const ans = step.popupAnswer || {};

const ansIcon = ans.iconFill    ? 'fill'
              : ans.iconEffects ? 'effects'
              : ans.iconLayout  ? 'layout'
              : ans.iconPicture ? 'picture'
              : ans.iconTable   ? 'table'
              : undefined;

    window._ppAns = {
        icon:        ansIcon,
        title:       ('title'       in ans) ? ans.title       : undefined,
        description: ('description' in ans) ? ans.description : undefined,
    };
    window._ppIconSelected = null;

    /* Nhãn hiển thị cho từng icon — dùng khi báo lỗi */
    const _ppIconLabels = {
        fill:    'Fill &amp; Line',
        effects: 'Effects',
        layout:  'Layout &amp; Properties',
        picture: 'Picture',
        table:   'Alt Text_Table',
    };
    window._ppIconLabels = _ppIconLabels;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:360px;gap:8px;padding:10px 14px;';
    body.innerHTML = `
    <!-- 5 Icon tabs -->
    <div style="display:flex;border-bottom:2px solid #e2e8f0;
                margin:-10px -14px 0;padding:0 6px;flex-wrap:wrap;">

        <div id="pp_icon_fill" class="pp-icon-tab" data-icon="fill"
            onclick="pp_altSelectIcon('fill')"
            style="display:flex;flex-direction:column;align-items:center;
                   padding:8px 10px;cursor:pointer;border-bottom:3px solid transparent;
                   transition:all 0.15s;gap:3px;font-size:14px;color:#64748b;">
            <svg width="22" height="22" viewBox="0 0 512 512" fill="#E05C00" xmlns="http://www.w3.org/2000/svg">
                <path d="M448 32c-17.7 0-32 14.3-32 32v64H64C28.7 128 0 156.7 0 192v256c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-17.7 14.3-32 32-32s32-14.3 32-32S465.7 32 448 32zM64 192h352v256H64V192z M96 240v160h288V240H96z"/>
            </svg>
            <span>Fill &amp; Line</span>
        </div>

        <div id="pp_icon_effects" class="pp-icon-tab" data-icon="effects"
            onclick="pp_altSelectIcon('effects')"
            style="display:flex;flex-direction:column;align-items:center;
                   padding:8px 10px;cursor:pointer;border-bottom:3px solid transparent;
                   transition:all 0.15s;gap:3px;font-size:14px;color:#64748b;">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 1.5 L20.5 8.3 L17.1 19.5 L4.9 19.5 L1.5 8.3 Z"
                      stroke="#1E6FBF" stroke-width="1.8" fill="white"/>
            </svg>
            <span>Effects</span>
        </div>

        <div id="pp_icon_layout" class="pp-icon-tab" data-icon="layout"
            onclick="pp_altSelectIcon('layout')"
            style="display:flex;flex-direction:column;align-items:center;
                   padding:8px 10px;cursor:pointer;border-bottom:3px solid transparent;
                   transition:all 0.15s;gap:3px;font-size:14px;color:#64748b;">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="2" y1="11" x2="20" y2="11" stroke="#C19000" stroke-width="1.8"/>
                <polyline points="5,8 2,11 5,14" stroke="#C19000" stroke-width="1.8" fill="none"/>
                <polyline points="17,8 20,11 17,14" stroke="#C19000" stroke-width="1.8" fill="none"/>
                <line x1="11" y1="2" x2="11" y2="20" stroke="#C19000" stroke-width="1.8"/>
                <polyline points="8,5 11,2 14,5" stroke="#C19000" stroke-width="1.8" fill="none"/>
                <polyline points="8,17 11,20 14,17" stroke="#C19000" stroke-width="1.8" fill="none"/>
            </svg>
            <span>Layout &amp; Properties</span>
        </div>

        <div id="pp_icon_picture" class="pp-icon-tab" data-icon="picture"
            onclick="pp_altSelectIcon('picture')"
            style="display:flex;flex-direction:column;align-items:center;
                   padding:8px 10px;cursor:pointer;border-bottom:3px solid transparent;
                   transition:all 0.15s;gap:3px;font-size:14px;color:#64748b;">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="18" height="14" rx="1.5" stroke="#555" stroke-width="1.6" fill="white"/>
                <circle cx="7" cy="9" r="1.8" fill="#555"/>
                <polyline points="2,16 7,11 11,15 14,12 20,17" stroke="#555" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
            </svg>
            <span>Picture</span>
        </div>

        <!-- ══ ICON MỚI: Alt Text_Table ══ -->
        <div id="pp_icon_table" class="pp-icon-tab" data-icon="table"
            onclick="pp_altSelectIcon('table')"
            style="display:flex;flex-direction:column;align-items:center;
                   padding:8px 10px;cursor:pointer;border-bottom:3px solid transparent;
                   transition:all 0.15s;gap:3px;font-size:14px;color:#64748b;">
            <!-- Icon lưới bảng (table grid) -->
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="18" height="16" rx="1.2" stroke="#2563eb" stroke-width="1.6" fill="white"/>
                <line x1="2" y1="8"  x2="20" y2="8"  stroke="#2563eb" stroke-width="1.3"/>
                <line x1="2" y1="13" x2="20" y2="13" stroke="#2563eb" stroke-width="1.3"/>
                <line x1="8"  y1="3" x2="8"  y2="19" stroke="#2563eb" stroke-width="1.3"/>
                <line x1="14" y1="3" x2="14" y2="19" stroke="#2563eb" stroke-width="1.3"/>
            </svg>
            <span>Alt Text_Table</span>
        </div>

    </div>

    <!-- Nội dung panel — dùng chung cho Picture & Table — ẩn mặc định -->
    <div id="pp_picturePanel" style="display:none;flex-direction:column;gap:8px;margin-top:8px;">

        <div id="pp_altTargetHint" style="font-size:14px;color:#64748b;"></div>

        <div>
            <label style="font-size:16px;display:block;margin-bottom:3px;">Title:</label>
            <input type="text" id="pp_pictureTitle" value=""
                placeholder="Nhập tiêu đề..."
                style="width:100%;padding:5px 8px;border:1px solid #94a3b8;
                       border-radius:3px;font-size:16px;box-sizing:border-box;">
        </div>
        <div>
            <label style="font-size:16px;display:block;margin-bottom:3px;">Description:</label>
            <textarea id="pp_pictureDesc" rows="3" placeholder="Nhập mô tả..."
                style="width:100%;padding:5px 8px;border:1px solid #94a3b8;
                       border-radius:3px;font-size:16px;box-sizing:border-box;
                       resize:vertical;font-family:Arial,sans-serif;"></textarea>
        </div>
    </div>

    <!-- Panel sai icon -->
    <div id="pp_wrongIconPanel"
        style="display:none;padding:16px;text-align:center;color:#94a3b8;
               font-size:14px;background:#f8fafc;border-radius:4px;
               border:1px dashed #e2e8f0;margin-top:8px;">
        <div style="font-size:24px;margin-bottom:6px;">🔍</div>
        <span id="pp_wrongIconMsg">Đây không phải mục cần chọn.</span>
    </div>

    <div class="pp-error" id="pp_err_picture"></div>

    <div class="pp-btn-row">
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkAltPopup()">OK</button>
    </div>`;
    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});
}

/* ── Chọn icon tab ── */
function pp_altSelectIcon(icon){
    _hidePopupError('pp_err_picture');
    window._ppIconSelected = icon;
    const a = window._ppAns||{};
    const labels = window._ppIconLabels||{};

    /* Reset tất cả tab */
    document.querySelectorAll('.pp-icon-tab').forEach(function(tab){
        tab.style.borderBottom = '3px solid transparent';
        tab.style.color        = '#64748b';
        tab.style.background   = '';
    });

    /* Highlight tab được chọn */
    const selTab = document.getElementById('pp_icon_'+icon);
    if(selTab){
        selTab.style.borderBottom = '3px solid #2563eb';
        selTab.style.color        = '#2563eb';
        selTab.style.background   = '#eff6ff';
    }

    const picturePanel = document.getElementById('pp_picturePanel');
    const wrongPanel    = document.getElementById('pp_wrongIconPanel');
    const wrongMsgEl     = document.getElementById('pp_wrongIconMsg');
    const hintEl         = document.getElementById('pp_altTargetHint');

    if(icon === a.icon){
        /* ✅ Đúng icon — hiện form nhập */
        if(picturePanel){ picturePanel.style.display = 'flex'; }
        if(wrongPanel)  { wrongPanel.style.display   = 'none'; }
        if(hintEl){
            hintEl.textContent = (icon === 'table')
                ? '🔳 Alt Text cho Table — nhập Title/Description cho bảng.'
                : '🖼 Alt Text cho Picture — nhập Title/Description cho hình ảnh.';
        }
    } else {
        /* ❌ Sai icon — hiện thông báo */
        if(picturePanel){ picturePanel.style.display = 'none'; }
        if(wrongPanel)  { wrongPanel.style.display   = 'block'; }

        if(a.icon){
            const correctLabel = labels[a.icon] || a.icon;
            if(wrongMsgEl){
                wrongMsgEl.innerHTML = 'Đây không phải mục cần chọn.<br>'
                    +'Hãy chọn đúng icon <strong>'+correctLabel+'</strong>.';
            }
            _showPopupError('pp_err_picture','❌ Sai icon!');
        }
    }
}

/* ── Hàm check ── */
function checkAltPopup(){
    _hidePopupError('pp_err_picture');
    const a = window._ppAns||{};

    /* Kiểm tra icon đã chọn */
    if(!window._ppIconSelected){
        _showPopupError('pp_err_picture','⚠️ Hãy chọn 1 icon trước.');
        return;
    }
    if(a.icon && window._ppIconSelected !== a.icon){
        _showPopupError('pp_err_picture','❌ Sai icon!');
        return;
    }

    /* Nếu icon đúng → kiểm tra title/description (dùng chung cho Picture & Table) */
    const title = (document.getElementById('pp_pictureTitle') ||{}).value||'';
    const desc  = (document.getElementById('pp_pictureDesc')  ||{}).value||'';

    let errors=[];
    if(a.title      !==undefined && title.trim()!==a.title)
        errors.push('Title→"'+a.title+'"');
    if(a.description!==undefined && desc.trim() !==a.description)
        errors.push('Description→"'+a.description+'"');

    if(errors.length){
        _showPopupError('pp_err_picture','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }
    closeMosPopup(); checkCorrect();
}
/* ============================================================
   23. POPUP FIND AND REPLACE — TAB GO TO //đoạn này là đáp án, //thay mặc đinh khi mở const sel = document.getElementById('pp_goto_Page');
//dổi mặc tiếp theo +'transition:background 0.1s;'      +(item==='Page'
popupType: 'goto',
popupAnswer: {
    	gotoHeading:     true,
    	enterValue:   '4',     
    	enterDefault: '1',      
    	btnNext:      true }},

popupType: 'goto',
popupAnswer: {
    	gotoBookmark: true,
    	bookmarkNames: ['Contact','Details','Summary'],   
    	bookmarkName: 'Details' }},

    bookmarkNames: ['Contact','Details','Summary'],   // danh sách hiển thị trong dropdown, tùy câu hỏi
    bookmarkName: 'Details'                            // đáp án đúng, phải khớp 1 trong danh sách trên
   ============================================================
popupType: 'goto',  
popupAnswer: {
     // Go to what — chỉ 1 cái true
     gotoPage:      true,
     gotoSection:   false,
     gotoLine:      false,
     gotoBookmark:  false,
     gotoComment:   false,
     gotoFootnote:  false,
     gotoEndnote:   false,
     gotoField:     false,
     gotoTable:     false,
     gotoGraphic:   false,
     gotoEquation:  false,
     gotoHeading:   false,

     // Enter what — giá trị nhập vào (số trang, tên bookmark...)
     // Dùng prefix để điều hướng:
     //   số dương '5'   → đến trang 5
     //   '+3'           → tiến 3 trang
     //   '-2'           → lùi 2 trang
     enterValue: '5',

     // Bookmark name (chỉ khi gotoBookmark: true)
     bookmarkName: 'MyBookmark',

     // Nút bấm — chỉ 1 cái true
     btnNext:      true,
     btnPrevious:  false,
   }
============================================================ */
/* Helper dùng chung: tạo <select> danh sách tên mẫu khi mục Bookmark,
   ngược lại tạo <input type="text"> bình thường cho các mục khác (Page/Section/Heading...) */
function _pp_gotoBuildInputEl(target, placeholders, defaultVal){
    if(target === 'Bookmark'){
        const sel = document.createElement('select');
        sel.id = 'pp_enterValue';
        sel.style.cssText = 'width:100%;padding:5px 8px;border:1px solid #94a3b8;'
            +'border-radius:3px;font-size:13px;box-sizing:border-box;background:#fff;';
        const opt0 = document.createElement('option');
        opt0.value = ''; opt0.textContent = '';
        sel.appendChild(opt0);
        (window._ppGotoNameOptions||[]).forEach(function(name){
            const o = document.createElement('option');
            o.value = name; o.textContent = name;
            sel.appendChild(o);
        });
        if(defaultVal !== undefined){ sel.value = String(defaultVal); }
        return sel;
    }
    const inp = document.createElement('input');
    inp.type        = 'text';
    inp.id          = 'pp_enterValue';
    inp.placeholder = (placeholders && placeholders[target]) || 'Enter value...';
    if(defaultVal !== undefined){ inp.value = String(defaultVal); }
    inp.style.cssText = 'width:100%;padding:5px 8px;border:1px solid #94a3b8;'
        +'border-radius:3px;font-size:13px;box-sizing:border-box;';
    return inp;
}

function openGotoPopup(step){
    const box = _createPopupShell('Find and Replace');
    const ans = step.popupAnswer || {};

    /* Giải mã target */
    const ansTarget =
          ans.gotoSection  ? 'Section'
        : ans.gotoLine     ? 'Line'
        : ans.gotoBookmark ? 'Bookmark'
        : ans.gotoComment  ? 'Comment'
        : ans.gotoFootnote ? 'Footnote'
        : ans.gotoEndnote  ? 'Endnote'
        : ans.gotoField    ? 'Field'
        : ans.gotoTable    ? 'Table'
        : ans.gotoGraphic  ? 'Graphic'
        : ans.gotoEquation ? 'Equation'
        : ans.gotoHeading  ? 'Heading'
        : 'Page';

    const ansBtn = ans.btnPrevious ? 'Previous' : 'Next';

    window._ppAns = {
        target:      ansTarget,
        enterValue:  ('enterValue'   in ans) ? String(ans.enterValue) : undefined,
        bookmarkName:('bookmarkName' in ans) ? ans.bookmarkName       : undefined,
        btn:         ansBtn,
    };
    window._ppGotoBtn = '';

    /* Danh sách Go to what */
    const gotoItems = [
        'Page','Section','Line','Bookmark','Comment',
        'Footnote','Endnote','Field','Table','Graphic','Equation','Heading'
    ];

    /* Placeholder gợi ý theo target */
    const placeholders = {
        Page:     'Enter page number (+3 / -2 / 5)',
        Section:  'Enter section number',
        Line:     'Enter line number',
        Bookmark: 'Enter bookmark name',
        Comment:  'Enter reviewer\'s name',
        Footnote: 'Enter footnote number',
        Endnote:  'Enter endnote number',
        Field:    'Enter field name',
        Table:    'Enter table number',
        Graphic:  'Enter graphic number',
        Equation: 'Enter equation number',
        Heading:  'Enter heading text',
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:460px;gap:0;padding:0;';

    /* ── Tab bar ── */
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;border-bottom:1px solid #cbd5e1;'
        +'background:#f1f5f9;padding:0 8px;';
    tabBar.innerHTML = `
        <button style="padding:6px 16px;font-size:14px;border:none;
            border-bottom:2px solid transparent;background:none;
            cursor:pointer;color:#64748b;"
            onclick="">Find</button>
        <button style="padding:6px 16px;font-size:14px;border:none;
            border-bottom:2px solid transparent;background:none;
            cursor:pointer;color:#64748b;"
            onclick="">Replace</button>
        <button style="padding:6px 16px;font-size:14px;border:none;
            border-bottom:2px solid #2563eb;background:none;
            cursor:pointer;font-weight:bold;color:#2563eb;">Go To</button>`;
    body.appendChild(tabBar);

    /* ── Body ── */
    const inner = document.createElement('div');
    inner.style.cssText = 'padding:12px 14px;display:flex;flex-direction:column;gap:10px;';
    body.appendChild(inner);

    /* ── Grid 2 cột ── */
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:160px 1fr;gap:12px;align-items:start;';

    /* CỘT TRÁI — danh sách */
    const leftCol = document.createElement('div');
    leftCol.style.cssText = 'display:flex;flex-direction:column;gap:2px;';

    const leftLabel = document.createElement('div');
    leftLabel.style.cssText = 'font-size:14px;color:#374151;margin-bottom:4px;font-weight:500;';
    leftLabel.textContent   = 'Go to what:';
    leftCol.appendChild(leftLabel);

    const listBox = document.createElement('div');
    listBox.style.cssText = 'border:1px solid #94a3b8;border-radius:3px;'
        +'background:#fff;overflow-y:auto;max-height:220px;';

    gotoItems.forEach(function(item){
        const row = document.createElement('div');
        row.id    = 'pp_goto_'+item;
row.style.cssText = 'padding:5px 12px;font-size:14px;cursor:pointer;'
    +'transition:background 0.1s;'
    +(item==='Page'
        ?'background:#2563eb;color:#fff;font-weight:bold;'
        :'color:#374151;');
        row.textContent = item;
        row.addEventListener('click', function(){ pp_gotoSelect(item); });
        row.addEventListener('mouseenter', function(){
            if(window._ppGotoTarget!==item)
                row.style.background = '#eff6ff';
        });
        row.addEventListener('mouseleave', function(){
            if(window._ppGotoTarget!==item)
                row.style.background = '';
        });
        listBox.appendChild(row);
    });
    leftCol.appendChild(listBox);
    grid.appendChild(leftCol);

    /* CỘT PHẢI — input + nút */
    const rightCol = document.createElement('div');
    rightCol.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
    rightCol.id = 'pp_gotoRight';

    /* Label động */
    const enterLabel = document.createElement('div');
    enterLabel.id = 'pp_enterLabel';
    enterLabel.style.cssText = 'font-size:14px;color:#374151;font-weight:500;';
    enterLabel.textContent = 'Enter page number:';
    rightCol.appendChild(enterLabel);

    /* Input nhập — tự đổi thành select danh sách tên mẫu nếu mục hiện tại là Bookmark */
    window._ppGotoNameOptions = Array.isArray(ans.bookmarkNames) ? ans.bookmarkNames : ['Apple','Microsoft'];
    const enterInput = _pp_gotoBuildInputEl(ansTarget, placeholders, ans.enterDefault);
    rightCol.appendChild(enterInput);

    /* Gợi ý prefix cho Page */
    const hint = document.createElement('div');
    hint.id = 'pp_gotoHint';
    hint.style.cssText = 'font-size:14px;color:#64748b;line-height:1.6;'
        +'background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:6px 8px;';
    hint.innerHTML = `
        <strong>Gợi ý nhập:</strong><br>
        &bull; <code>5</code> → đến trang 5<br>
        &bull; <code>+3</code> → tiến 3 trang<br>
        &bull; <code>-2</code> → lùi 2 trang`;
    rightCol.appendChild(hint);

    /* Nút Previous / Next / Close */
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:4px;';

    const btnPrev = document.createElement('button');
    btnPrev.className   = 'pp-btn';
    btnPrev.textContent = '◀ Previous';
    btnPrev.style.cssText = 'font-size:14px;padding:4px 14px;';
    btnPrev.onclick = function(){ window._ppGotoBtn='Previous'; checkGotoPopup(); };

    const btnNext = document.createElement('button');
    btnNext.className   = 'pp-btn pp-btn-ok';
    btnNext.textContent = 'Next ▶';
    btnNext.style.cssText = 'font-size:14px;padding:4px 14px;';
    btnNext.onclick = function(){ window._ppGotoBtn='Next'; checkGotoPopup(); };

    const btnClose = document.createElement('button');
    btnClose.className   = 'pp-btn pp-btn-cancel';
    btnClose.textContent = 'Close';
    btnClose.onclick     = function(){ closeMosPopup(); };

    btnRow.appendChild(btnPrev);
    btnRow.appendChild(btnNext);
    btnRow.appendChild(btnClose);
    rightCol.appendChild(btnRow);

    grid.appendChild(rightCol);
    inner.appendChild(grid);

    /* Error */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id        = 'pp_err_goto';
    inner.appendChild(errDiv);

    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

    /* Init */
    window._ppGotoTarget = 'Page';
    window._ppPlaceholders = placeholders;

    /* Scroll đến item được chọn */
    setTimeout(function(){
        const sel = document.getElementById('pp_goto_Page');
        if(sel){ sel.scrollIntoView({block:'nearest'}); }
    }, 50);
}

/* ── Chọn item trong danh sách ── */
function pp_gotoSelect(item){
    _hidePopupError('pp_err_goto');

    /* Reset tất cả */
    ['Page','Section','Line','Bookmark','Comment','Footnote','Endnote',
     'Field','Table','Graphic','Equation','Heading'].forEach(function(i){
        const el = document.getElementById('pp_goto_'+i);
        if(el){ el.style.background=''; el.style.color='#374151'; el.style.fontWeight=''; }
    });

    /* Highlight chọn */
    const sel = document.getElementById('pp_goto_'+item);
    if(sel){ sel.style.background='#2563eb'; sel.style.color='#fff'; sel.style.fontWeight='bold'; }

    window._ppGotoTarget = item;

    /* Cập nhật label + đổi loại ô nhập (select danh sách tên / input text) tùy theo mục đang chọn */
    const labelEl = document.getElementById('pp_enterLabel');
    const oldInputEl = document.getElementById('pp_enterValue');
    const hintEl  = document.getElementById('pp_gotoHint');
    if(labelEl){ labelEl.textContent = 'Enter '+item.toLowerCase()+':'; }
    if(oldInputEl){
        const newInputEl = _pp_gotoBuildInputEl(item, window._ppPlaceholders, undefined);
        oldInputEl.replaceWith(newInputEl);
    }
    /* Chỉ hiện hint prefix khi là Page */
    if(hintEl){ hintEl.style.display = (item==='Page')?'block':'none'; }
}

/* ── Hàm check ── */
function checkGotoPopup(){
    _hidePopupError('pp_err_goto');
    const a = window._ppAns||{};

    const target = window._ppGotoTarget||'';
    const val    = (document.getElementById('pp_enterValue')||{}).value||'';
    const btn    = window._ppGotoBtn||'';

    let errors=[];

    if(a.target && target!==a.target)
        errors.push('Go to what→'+a.target);

    if(a.enterValue!==undefined && val.trim()!==a.enterValue)
        errors.push('Giá trị→"'+a.enterValue+'"');

    if(a.bookmarkName!==undefined && val.trim()!==a.bookmarkName)
        errors.push('Bookmark→"'+a.bookmarkName+'"');

    if(a.btn && btn!==a.btn)
        errors.push('Nút bấm→'+a.btn
            +(a.btn==='Next'?' (Next ▶)':' (◀ Previous)'));

    if(errors.length){
        _showPopupError('pp_err_goto','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   24. POPUP DROP CAP OPTIONS //copy HTML đoạn đáp án
popupType: 'drop-cap',
popupAnswer: {
    posDropped:        false,
    posInMargin:true,   
    fontTimesNewRoman: true,
    linesDropped:      4,
    distanceFromText:  0,
}},
   ============================================================
   popupAnswer: {
     // Position — chỉ 1 cái true
     posNone:    false,  // None
     posDropped: true,   // Dropped (trong đoạn văn)
     posInMargin:false,  // In margin (ra ngoài lề)

     // Font
     fontTimesNewRoman: true,
     fontArial:         false,
     fontCalibri:       false,

     // Lines to drop
     linesDropped: 3,    // số dòng (1-10)

     // Distance from text (cm)
     distanceFromText: 0.00,
   }
============================================================ */
function openDropCapPopup(step){
    const box = _createPopupShell('Drop Cap');
    const ans = step.popupAnswer || {};

    /* Giải mã position */
const ansPos  = ans.posInMargin ? 'margin'
                  : ans.posDropped  ? 'dropped'
                  : 'none';

    /* Giải mã font */
    const ansFont = ans.fontArial   ? 'Arial'
                  : ans.fontCalibri ? 'Calibri'
                  : ans.fontTimesNewRoman ? 'Times New Roman'
                  : '';

    window._ppAns = {
        position:         ansPos,
        font:             ansFont,
        linesDropped:     ('linesDropped'     in ans) ? ans.linesDropped     : undefined,
        distanceFromText: ('distanceFromText' in ans) ? ans.distanceFromText : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:300px;gap:6px;padding:12px 14px;';
    body.innerHTML = `

    <!-- Position -->
    <div class="pp-group-title" style="margin-top:0;">Position</div>
    <div style="display:flex;gap:12px;justify-content:center;margin-bottom:2px;">

        <!-- None -->
        <div id="pp_dc_none" onclick="pp_dcSelect('none')"
            style="display:flex;flex-direction:column;align-items:center;
                   gap:5px;cursor:pointer;padding:8px 10px;border-radius:5px;
/* Icon None — mặc định selected */
border:2px solid #2563eb;background:#dbeafe;
                   transition:all 0.15s;min-width:70px;">
            <!-- Icon None -->
            <div style="width:48px;height:44px;border:1px solid #cbd5e1;
                        background:#fff;border-radius:3px;display:flex;
                        align-items:center;justify-content:center;">
                <div style="width:32px;">
                    <div style="height:5px;background:#d1d5db;border-radius:1px;margin-bottom:2px;"></div>
                    <div style="height:5px;background:#d1d5db;border-radius:1px;margin-bottom:2px;"></div>
                    <div style="height:5px;background:#d1d5db;border-radius:1px;width:70%;"></div>
                </div>
            </div>
            <span style="font-size:14px;color:#374151;
font-weight:bold     /* None */; ">None</span>
        </div>

        <!-- Dropped -->
        <div id="pp_dc_dropped" onclick="pp_dcSelect('dropped')"
            style="display:flex;flex-direction:column;align-items:center;
                   gap:5px;cursor:pointer;padding:8px 10px;border-radius:5px;
/* Icon Dropped — mặc định không chọn */
border:2px solid #e2e8f0;background:#f8fafc;
                   transition:all 0.15s;min-width:70px;">
            <!-- Icon Dropped -->
            <div style="width:48px;height:44px;border:1px solid #cbd5e1;
                        background:#fff;border-radius:3px;padding:4px;
                        display:flex;gap:3px;align-items:flex-start;">
                <!-- Chữ D lớn -->
                <div style="font-size:22px;font-weight:bold;color:#374151;
                            line-height:1;font-family:serif;margin-top:0px;">D</div>
                <!-- Dòng text -->
                <div style="flex:1;display:flex;flex-direction:column;gap:2px;margin-top:2px;">
                    <div style="height:3px;background:#d1d5db;border-radius:1px;"></div>
                    <div style="height:3px;background:#d1d5db;border-radius:1px;"></div>
                    <div style="height:3px;background:#d1d5db;border-radius:1px;width:70%;"></div>
                    <div style="height:3px;background:#d1d5db;border-radius:1px;margin-top:2px;"></div>
                    <div style="height:3px;background:#d1d5db;border-radius:1px;"></div>
                </div>
            </div>
            <span style="font-size:14px;color:#374151; font-weight:normal   /* Dropped */;">Dropped</span>
        </div>

        <!-- In margin -->
        <div id="pp_dc_margin" onclick="pp_dcSelect('margin')"
            style="display:flex;flex-direction:column;align-items:center;
                   gap:5px;cursor:pointer;padding:8px 10px;border-radius:5px;
/* Icon In margin — mặc định không chọn */
border:2px solid #e2e8f0;background:#f8fafc;
                   transition:all 0.15s;min-width:70px;">
            <!-- Icon In margin -->
            <div style="width:48px;height:44px;border:1px solid #cbd5e1;
                        background:#fff;border-radius:3px;padding:4px;
                        display:flex;gap:2px;align-items:flex-start;">
                <!-- Chữ D ra ngoài lề -->
                <div style="font-size:22px;font-weight:bold;color:#374151;
                            line-height:1;font-family:serif;margin-left:-6px;">D</div>
                <!-- Dòng text -->
                <div style="flex:1;display:flex;flex-direction:column;gap:2px;margin-top:2px;">
                    <div style="height:3px;background:#d1d5db;border-radius:1px;"></div>
                    <div style="height:3px;background:#d1d5db;border-radius:1px;"></div>
                    <div style="height:3px;background:#d1d5db;border-radius:1px;width:70%;"></div>
                    <div style="height:3px;background:#d1d5db;border-radius:1px;margin-top:2px;"></div>
                    <div style="height:3px;background:#d1d5db;border-radius:1px;"></div>
                </div>
            </div>
            <span style="font-size:14px;color:#374151; font-weight:normal   /* In margin */;">In margin</span>
        </div>

    </div>

    <!-- Options -->
    <div class="pp-group-title">Options</div>
    <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:center;">

        <!-- Font -->
        <label style="font-size:12px;white-space:nowrap;">Font:</label>
        <select id="pp_dcFont" style="font-size:12px;padding:4px 6px;
            border:1px solid #94a3b8;border-radius:3px;">

            <option value="Times New Roman">Times New Roman</option>
            <option value="Arial">Arial</option>
            <option value="Calibri">Calibri</option>
            <option value="Cambria">Cambria</option>
            <option value="Georgia">Georgia</option>
        </select>

        <!-- Lines to drop -->
        <label style="font-size:12px;white-space:nowrap;">Lines to drop:</label>
        <div style="display:flex;align-items:center;gap:4px;">
            <input type="number" id="pp_dcLines"
                min="1" max="10" value=""
                placeholder="3"
                style="width:60px;font-size:12px;padding:4px 6px;
                       border:1px solid #94a3b8;border-radius:3px;">
            <div style="display:flex;flex-direction:column;gap:1px;">
                <button onclick="pp_dcStep('lines',1)"
                    style="width:18px;height:13px;font-size:9px;padding:0;
                           border:1px solid #94a3b8;border-radius:2px;
                           background:#f1f5f9;cursor:pointer;line-height:1;">▲</button>
                <button onclick="pp_dcStep('lines',-1)"
                    style="width:18px;height:13px;font-size:9px;padding:0;
                           border:1px solid #94a3b8;border-radius:2px;
                           background:#f1f5f9;cursor:pointer;line-height:1;">▼</button>
            </div>
        </div>

        <!-- Distance from text -->
        <label style="font-size:12px;white-space:nowrap;">Distance from text:</label>
        <div style="display:flex;align-items:center;gap:4px;">
<input type="number" id="pp_dcDist"
    min="0" max="10" step="0.01" value="0"
    placeholder="0.00"
                style="width:60px;font-size:12px;padding:4px 6px;
                       border:1px solid #94a3b8;border-radius:3px;">
            <div style="display:flex;flex-direction:column;gap:1px;">
                <button onclick="pp_dcStep('dist',0.1)"
                    style="width:18px;height:13px;font-size:9px;padding:0;
                           border:1px solid #94a3b8;border-radius:2px;
                           background:#f1f5f9;cursor:pointer;line-height:1;">▲</button>
                <button onclick="pp_dcStep('dist',-0.1)"
                    style="width:18px;height:13px;font-size:9px;padding:0;
                           border:1px solid #94a3b8;border-radius:2px;
                           background:#f1f5f9;cursor:pointer;line-height:1;">▼</button>
            </div>
            <span style="font-size:11px;color:#64748b;">cm</span>
        </div>

    </div>

    <div class="pp-error" id="pp_err_dropcap"></div>
    <div class="pp-btn-row">
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkDropCapPopup()">OK</button>
    </div>`;
box.appendChild(body);
window._ppDcPos = 'none';  /* ← mặc định None */
    /* Set font mặc định */
    setTimeout(function(){
        const fontEl = document.getElementById('pp_dcFont');
        if(fontEl) fontEl.value = 'Times New Roman';
    }, 30);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

}

/* ── Chọn position ── */
function pp_dcSelect(pos){
    ['none','dropped','margin'].forEach(function(p){
        const el = document.getElementById('pp_dc_'+p);
        if(!el){return;}
        if(p===pos){
            el.style.border     = '2px solid #2563eb';
            el.style.background = '#dbeafe';
            const lbl = el.querySelector('span');
            if(lbl) lbl.style.fontWeight = 'bold';
        } else {
            el.style.border     = '2px solid #e2e8f0';
            el.style.background = '#f8fafc';
            const lbl = el.querySelector('span');
            if(lbl) lbl.style.fontWeight = 'normal';
        }
    });
    window._ppDcPos = pos;
}

/* ── Tăng/giảm giá trị ── */
function pp_dcStep(field, delta){
    if(field==='lines'){
        const el = document.getElementById('pp_dcLines');
        if(!el){return;}
        const v = parseInt(el.value)||3;
        el.value = Math.min(10, Math.max(1, v+delta));
    } else {
        const el = document.getElementById('pp_dcDist');
        if(!el){return;}
        const v = parseFloat(el.value)||0;
        el.value = Math.max(0, parseFloat((v+delta).toFixed(2)));
    }
}

/* ── Hàm check ── */
function checkDropCapPopup(){
    _hidePopupError('pp_err_dropcap');
    const a    = window._ppAns||{};
    const pos  = window._ppDcPos || 'none';
    const font = (document.getElementById('pp_dcFont') ||{}).value||'';
    const linesEl = document.getElementById('pp_dcLines');
    const distEl  = document.getElementById('pp_dcDist');
    const lines   = linesEl&&linesEl.value!=='' ? parseInt(linesEl.value)     : undefined;
const dist = distEl ? parseFloat(distEl.value||'0') : undefined;

    let errors=[];
    if(a.position         && pos  !==a.position)             errors.push('Position→'+a.position);
    if(a.font             && font !==a.font)                  errors.push('Font→'+a.font);
    if(a.linesDropped     !==undefined){
        if(lines===undefined||(isNaN(lines)||lines!==a.linesDropped))
            errors.push('Lines to drop→'+a.linesDropped);
    }
    if(a.distanceFromText !==undefined){
        if(dist===undefined||(isNaN(dist)||dist!==a.distanceFromText))
            errors.push('Distance→'+a.distanceFromText+'cm');
    }

    if(errors.length){
        _showPopupError('pp_err_dropcap','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   25. POPUP MANAGE SOURCES — EDIT SOURCE //mẫu đáp án, không muốn nhập mục nào thì xóa ''
popupType: 'manage-sources',
popupAnswer: {
    typeBook:    true,
    author:      'A',
    title:       'Word',
    year:        '2027',
    city:        'HN',
    publisher:   'NXB' }},
   ============================================================
   popupAnswer: {
     // Type of source — chỉ 1 cái true
     typeBook:          true,
     typeJournal:       false,
     typeConference:    false,
     typeReport:        false,
     typeWebsite:       false,
     typeDocumentWeb:   false,
     typeInterview:     false,
     typeFilm:          false,
     typeArtwork:       false,
     typeSound:         false,
     typeMisc:          false,

     // Các field chung
     author:      'Nguyen Van A',
     title:       'Introduction to Word Processing',
     year:        '2024',
     city:        'Hanoi',

     // Book
     publisher:   'NXB Giáo Dục',
     edition:     '2nd',
     volume:      '',

     // Journal
     journalName: '',
     pages:       '',
     issue:       '',

     // Website
     webUrl:      '',
     accessDate:  '',

     // Chọn ngôn ngữ
     langEnglish:     true,
     langVietnamese:  false,
   }
============================================================ */
function openManageSourcesPopup(step){
    const box = _createPopupShell('Edit Source');
    const ans = step.popupAnswer || {};

    /* Giải mã type */
    const ansType =
          ans.typeJournal     ? 'Journal'
        : ans.typeConference  ? 'Conference'
        : ans.typeReport      ? 'Report'
        : ans.typeWebsite     ? 'Website'
        : ans.typeDocumentWeb ? 'DocumentWeb'
        : ans.typeInterview   ? 'Interview'
        : ans.typeFilm        ? 'Film'
        : ans.typeArtwork     ? 'Artwork'
        : ans.typeSound       ? 'Sound'
        : ans.typeMisc        ? 'Misc'
        : 'Book';

    const ansLang = ans.langVietnamese ? 'Vietnamese' : 'English';

    window._ppAns = {
        type:        ansType,
        author:      ('author'      in ans)?ans.author      :undefined,
        title:       ('title'       in ans)?ans.title       :undefined,
        year:        ('year'        in ans)?ans.year        :undefined,
        city:        ('city'        in ans)?ans.city        :undefined,
        publisher:   ('publisher'   in ans)?ans.publisher   :undefined,
        edition:     ('edition'     in ans)?ans.edition     :undefined,
        volume:      ('volume'      in ans)?ans.volume      :undefined,
        journalName: ('journalName' in ans)?ans.journalName :undefined,
        pages:       ('pages'       in ans)?ans.pages       :undefined,
        issue:       ('issue'       in ans)?ans.issue       :undefined,
        webUrl:      ('webUrl'      in ans)?ans.webUrl      :undefined,
        accessDate:  ('accessDate'  in ans)?ans.accessDate  :undefined,
        lang:        ansLang,
    };

    const types = [
        {val:'Book',        label:'Book'},
        {val:'Journal',     label:'Journal Article'},
        {val:'Conference',  label:'Conference Proceedings'},
        {val:'Report',      label:'Report'},
        {val:'Website',     label:'Web site'},
        {val:'DocumentWeb', label:'Document from Web site'},
        {val:'Interview',   label:'Interview'},
        {val:'Film',        label:'Film'},
        {val:'Artwork',     label:'Art'},
        {val:'Sound',       label:'Sound Recording'},
        {val:'Misc',        label:'Miscellaneous'},
    ];

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:540px;gap:0;padding:12px 14px;';
    body.innerHTML = `
    <div style="display:grid;grid-template-columns:180px 1fr;gap:12px;align-items:start;">

      <!-- ===== CỘT TRÁI: Type + Language + Show + Preview + Buttons ===== -->
      <div style="display:flex;flex-direction:column;gap:8px;">

        <!-- Type of Source -->
        <div>
          <label style="font-size:12px;display:block;margin-bottom:3px;font-weight:500;">
              Type of Source:</label>
          <select id="pp_srcType" style="width:100%;font-size:12px;padding:4px 6px;
              border:1px solid #94a3b8;border-radius:3px;"
              onchange="pp_srcTypeChange()">
              ${types.map(t=>`<option value="${t.val}"
                  ${t.val==='Book'?'selected':''}>${t.label}</option>`).join('')}
          </select>
        </div>

        <!-- Language -->
        <div>
          <label style="font-size:12px;display:block;margin-bottom:3px;font-weight:500;">
              Language:</label>
          <select id="pp_srcLang" style="width:100%;font-size:12px;padding:4px 6px;
              border:1px solid #94a3b8;border-radius:3px;">
              <option value="English" selected>English</option>
              <option value="Vietnamese">Vietnamese</option>
              <option value="French">French</option>
              <option value="German">German</option>
          </select>
        </div>

        <!-- Show all fields -->
        <div>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
              <input type="checkbox" id="pp_srcShowAll">
              Show All Bibliography Fields
          </label>
        </div>

        <!-- Preview -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:8px;">
          <div style="font-size:14px;font-weight:bold;color:#64748b;margin-bottom:4px;">
              Preview (APA):</div>
          <div id="pp_srcPreview"
              style="font-size:14px;color:#374151;font-style:italic;min-height:30px;line-height:1.5;">
              —
          </div>
        </div>

        <!-- Error + Buttons -->
        <div class="pp-error" id="pp_err_src"></div>
        <div style="display:flex;gap:6px;flex-direction:column;">
          <button class="pp-btn pp-btn-ok" onclick="checkManageSourcesPopup()"
              style="width:100%;font-size:14px;">OK</button>
          <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()"
              style="width:100%;font-size:14px;">Cancel</button>
        </div>

      </div>

      <!-- ===== CỘT PHẢI: Bibliography Fields ===== -->
      <div style="border:1px solid #e2e8f0;border-radius:4px;padding:10px;
                  display:flex;flex-direction:column;gap:6px;">

        <div class="pp-group-title" style="margin-top:0;margin-bottom:4px;">
            Bibliography Fields</div>

        <!-- Author -->
        <div style="display:grid;grid-template-columns:70px 1fr auto;gap:5px;align-items:center;">
            <label style="font-size:12px;">Author:</label>
            <input type="text" id="pp_srcAuthor" value=""
                placeholder="Last, First Middle"
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;">
            <button class="pp-btn" style="font-size:11px;padding:3px 8px;">Edit...</button>
        </div>

        <!-- Title -->
        <div style="display:grid;grid-template-columns:70px 1fr;gap:5px;align-items:center;">
            <label style="font-size:12px;">Title:</label>
            <input type="text" id="pp_srcTitle" value=""
                placeholder="Document title"
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;">
        </div>

        <!-- Year -->
        <div style="display:grid;grid-template-columns:70px 1fr;gap:5px;align-items:center;">
            <label style="font-size:12px;">Year:</label>
            <input type="text" id="pp_srcYear" value=""
                placeholder="2024"
                style="width:80px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;">
        </div>

        <!-- City -->
        <div style="display:grid;grid-template-columns:70px 1fr;gap:5px;align-items:center;">
            <label style="font-size:12px;">City:</label>
            <input type="text" id="pp_srcCity" value=""
                placeholder="City of publication"
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;">
        </div>

        <!-- Dynamic fields theo type -->
        <div id="pp_srcDynamic"></div>

      </div>

    </div>`;
    box.appendChild(body);
    /* Render dynamic fields và preview */
    setTimeout(function(){
        pp_srcTypeChange();
    }, 30);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '10px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

}

/* ── Render fields động theo type ── */
function pp_srcTypeChange(){
    const type = (document.getElementById('pp_srcType')||{}).value||'Book';
    const dyn  = document.getElementById('pp_srcDynamic');
    if(!dyn){return;}

    let html = '';

    if(type==='Book'){
        html = `
        <div style="display:grid;grid-template-columns:110px 1fr;gap:6px;align-items:center;">
            <label style="font-size:14px;">Publisher:</label>
            <input type="text" id="pp_srcPublisher" value=""
                placeholder="Publisher name"
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;">
        </div>
        <div style="display:grid;grid-template-columns:110px 1fr 110px 1fr;gap:6px;align-items:center;">
            <label style="font-size:14px;">Edition:</label>
            <input type="text" id="pp_srcEdition" value="" placeholder="e.g. 2nd"
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;">
            <label style="font-size:14px;">Volume:</label>
            <input type="text" id="pp_srcVolume" value="" placeholder="Vol."
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;">
        </div>`;
    } else if(type==='Journal'){
        html = `
        <div style="display:grid;grid-template-columns:110px 1fr;gap:6px;align-items:center;">
            <label style="font-size:12px;">Journal Name:</label>
            <input type="text" id="pp_srcJournal" value=""
                placeholder="Journal name"
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;">
        </div>
        <div style="display:grid;grid-template-columns:110px 1fr 110px 1fr;gap:6px;align-items:center;">
            <label style="font-size:12px;">Pages:</label>
            <input type="text" id="pp_srcPages" value="" placeholder="e.g. 10-25"
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;">
            <label style="font-size:12px;">Issue:</label>
            <input type="text" id="pp_srcIssue" value="" placeholder="e.g. 3"
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;">
        </div>`;
    } else if(type==='Website'||type==='DocumentWeb'){
        html = `
        <div style="display:grid;grid-template-columns:110px 1fr;gap:6px;align-items:center;">
            <label style="font-size:12px;">URL:</label>
            <input type="text" id="pp_srcUrl" value=""
                placeholder="https://..."
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;">
        </div>
        <div style="display:grid;grid-template-columns:110px 1fr;gap:6px;align-items:center;">
            <label style="font-size:12px;">Access Date:</label>
            <input type="text" id="pp_srcAccessDate" value=""
                placeholder="DD/MM/YYYY"
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:12px;">
        </div>`;
    } else {
        html = `
        <div style="display:grid;grid-template-columns:110px 1fr;gap:6px;align-items:center;">
            <label style="font-size:12px;">Publisher:</label>
            <input type="text" id="pp_srcPublisher" value=""
                placeholder="Publisher / Organization"
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:16px;">
        </div>`;
    }

    dyn.innerHTML = html;

    /* Gắn preview update */
    dyn.querySelectorAll('input').forEach(function(inp){
        inp.addEventListener('input', pp_srcUpdatePreview);
    });
    ['pp_srcAuthor','pp_srcTitle','pp_srcYear','pp_srcCity'].forEach(function(id){
        const el = document.getElementById(id);
        if(el){ el.addEventListener('input', pp_srcUpdatePreview); }
    });

    pp_srcUpdatePreview();
}

/* ── Cập nhật preview APA ── */
function pp_srcUpdatePreview(){
    const author = (document.getElementById('pp_srcAuthor')||{}).value||'';
    const title  = (document.getElementById('pp_srcTitle') ||{}).value||'';
    const year   = (document.getElementById('pp_srcYear')  ||{}).value||'';
    const city   = (document.getElementById('pp_srcCity')  ||{}).value||'';
    const pub    = (document.getElementById('pp_srcPublisher')||{}).value||'';
    const prv    = document.getElementById('pp_srcPreview');
    if(!prv){return;}

    const parts=[];
    if(author) parts.push(author);
    if(year)   parts.push('('+year+')');
    if(title)  parts.push('<em>'+title+'</em>');
    if(city&&pub) parts.push(city+': '+pub);
    else if(pub)  parts.push(pub);

    prv.innerHTML = parts.length ? parts.join('. ')+'.' : '—';
}

/* ── Hàm check ── */
function checkManageSourcesPopup(){
    _hidePopupError('pp_err_src');
    const a    = window._ppAns||{};
    const type = (document.getElementById('pp_srcType')  ||{}).value||'';
    const lang = (document.getElementById('pp_srcLang')  ||{}).value||'';
    const auth = (document.getElementById('pp_srcAuthor')||{}).value||'';
    const ttl  = (document.getElementById('pp_srcTitle') ||{}).value||'';
    const yr   = (document.getElementById('pp_srcYear')  ||{}).value||'';
    const city = (document.getElementById('pp_srcCity')  ||{}).value||'';
    const pub  = (document.getElementById('pp_srcPublisher' )||{}).value||'';
    const edt  = (document.getElementById('pp_srcEdition'   )||{}).value||'';
    const vol  = (document.getElementById('pp_srcVolume'    )||{}).value||'';
    const jrn  = (document.getElementById('pp_srcJournal'   )||{}).value||'';
    const pgs  = (document.getElementById('pp_srcPages'     )||{}).value||'';
    const iss  = (document.getElementById('pp_srcIssue'     )||{}).value||'';
    const url  = (document.getElementById('pp_srcUrl'       )||{}).value||'';
    const acc  = (document.getElementById('pp_srcAccessDate')||{}).value||'';

    let errors=[];
    if(a.type        && type !==a.type)        errors.push('Type→'+a.type);
    if(a.lang        && lang !==a.lang)        errors.push('Language→'+a.lang);
    if(a.author      !==undefined&&auth.trim()!==a.author)      errors.push('Author→"'+a.author+'"');
    if(a.title       !==undefined&&ttl.trim() !==a.title)       errors.push('Title→"'+a.title+'"');
    if(a.year        !==undefined&&yr.trim()  !==a.year)        errors.push('Year→"'+a.year+'"');
    if(a.city        !==undefined&&city.trim()!==a.city)        errors.push('City→"'+a.city+'"');
    if(a.publisher   !==undefined&&pub.trim() !==a.publisher)   errors.push('Publisher→"'+a.publisher+'"');
    if(a.edition     !==undefined&&edt.trim() !==a.edition)     errors.push('Edition→"'+a.edition+'"');
    if(a.volume      !==undefined&&vol.trim() !==a.volume)      errors.push('Volume→"'+a.volume+'"');
    if(a.journalName !==undefined&&jrn.trim() !==a.journalName) errors.push('Journal→"'+a.journalName+'"');
    if(a.pages       !==undefined&&pgs.trim() !==a.pages)       errors.push('Pages→"'+a.pages+'"');
    if(a.issue       !==undefined&&iss.trim() !==a.issue)       errors.push('Issue→"'+a.issue+'"');
    if(a.webUrl      !==undefined&&url.trim() !==a.webUrl)      errors.push('URL→"'+a.webUrl+'"');
    if(a.accessDate  !==undefined&&acc.trim() !==a.accessDate)  errors.push('AccessDate→"'+a.accessDate+'"');

    if(errors.length){
        _showPopupError('pp_err_src','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   26. POPUP 1: FIND (Navigation Pane — Ctrl+F) //copy vào HTML
   popupType: 'find-nav'
   ============================================================
popupType: 'find-nav',  
popupAnswer: {
    searchText: "mos",
    docText: "Why study in MOS\nMOS is a suite of productivity applications that includes Word and Excel.\nSở hữu chứng chỉ MOS giúp bạn khẳng định kỹ năng Tin học văn phòng.\nĐăng ký thi MOS ngay hôm nay để nhận ưu đãi học phí."
	}},
============================================================ */
function openFindNavPopup(step){
    const box = _createPopupShell('Navigation');
    const ans = step.popupAnswer || {};

    const ansTab  = ans.tabHeadings ? 'Headings'
                  : ans.tabPages    ? 'Pages'
                  : 'Results';

    window._ppAns = {
        searchText: ('searchText' in ans) ? ans.searchText : undefined,
        tab:        ansTab,
    };

/* ── 1. DỮ LIỆU VĂN BẢN GIẢ LẬP ĐẦY ĐỦ 4 TỪ MOS ── */
    const mockDocumentText = ans.docText || 
        "Why study in MOS. MOS is a suite of productivity applications that includes Word and Excel.\n" +
        "Sở hữu chứng chỉ MOS giúp bạn khẳng định kỹ năng Tin học văn phòng.\n" +
        "Đăng ký thi MOS ngay hôm nay để nhận ưu đãi học phí.";

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:260px;max-width:300px;gap:0;padding:0;';
    body.innerHTML = `
    <!-- Search box -->
    <div style="padding:8px 10px;border-bottom:1px solid #e2e8f0;
                display:flex;align-items:center;gap:4px;">
        <input type="text" id="pp_findText"
            placeholder="Nhập từ cần tìm..."
            style="flex:1;padding:5px 8px;border:1px solid #94a3b8;
                   border-radius:3px;font-size:13px;outline:none;">
        <button id="pp_findClear"
            onclick="pp_findClear()"
            style="border:none;background:none;cursor:pointer;
                   color:#94a3b8;font-size:16px;padding:2px 4px;
                   line-height:1;">✕</button>
        <button style="border:none;background:none;cursor:pointer;
                   color:#64748b;font-size:14px;padding:2px 4px;">▾</button>
    </div>

    <!-- Kết quả đếm -->
    <div id="pp_findCount"
        style="padding:4px 10px;font-size:11px;color:#64748b;
               border-bottom:1px solid #f1f5f9;background:#fafafa;">
        Nhập từ khóa để tìm kiếm
    </div>

    <!-- Tabs: Headings / Pages / Results -->
    <div style="display:flex;border-bottom:1px solid #e2e8f0;background:#f9fafb;">
        <button id="pp_tab_Headings" onclick="pp_findTab('Headings')"
            style="flex:1;padding:5px 4px;font-size:11px;border:none;
                   border-bottom:2px solid transparent;background:none;
                   cursor:pointer;color:#64748b;">Headings</button>
        <button id="pp_tab_Pages" onclick="pp_findTab('Pages')"
            style="flex:1;padding:5px 4px;font-size:11px;border:none;
                   border-bottom:2px solid transparent;background:none;
                   cursor:pointer;color:#64748b;">Pages</button>
        <button id="pp_tab_Results" onclick="pp_findTab('Results')"
            style="flex:1;padding:5px 4px;font-size:11px;border:none;
                   border-bottom:2px solid #2563eb;background:none;
                   cursor:pointer;color:#2563eb;font-weight:bold;">Results</button>
    </div>

    <!-- Danh sách kết quả tìm kiếm -->
    <div id="pp_findResults"
        style="padding:8px 10px;min-height:100px;max-height:180px;
               overflow-y:auto;font-size:13px;line-height:1.5;color:#374151;display:flex;flex-direction:column;gap:6px;">
        <div style="color:#94a3b8;font-style:italic;text-align:center;
                    margin-top:30px;">Nhập từ khóa để tìm kiếm...</div>
    </div>

    <div class="pp-error" id="pp_err_find"
        style="margin:0 10px 8px;"></div>

    <!-- Nút điều hướng + Cancel -->
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:6px 10px;border-top:1px solid #e2e8f0;background:#f9fafb;">
        <div style="display:flex;gap:3px;">
            <button onclick="pp_findNav(-1)"
                style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:3px;
                       background:#fff;cursor:pointer;font-size:12px;">▲</button>
            <button onclick="pp_findNav(1)"
                style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:3px;
                       background:#fff;cursor:pointer;font-size:12px;">▼</button>
        </div>
        <div style="display:flex;gap:6px;">
            <button class="pp-btn pp-btn-cancel"
                onclick="closeMosPopup()" style="font-size:12px;padding:4px 12px;">Cancel</button>
            <button class="pp-btn pp-btn-ok"
                onclick="checkFindNavPopup()" style="font-size:12px;padding:4px 12px;">OK</button>
        </div>
    </div>`;
    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button').forEach(el=>{
        el.style.fontSize = '14px';});

    /* Gắn sự kiện tìm kiếm */
    setTimeout(function(){
        const inp = document.getElementById('pp_findText');
        if(inp){
            inp.addEventListener('input', function(){
                pp_findSearch(inp.value, mockDocumentText, ans.searchText||'');
            });
            inp.focus();
        }
        /* Set tab mặc định */
        pp_findTab(ansTab);
    }, 30);
}

function pp_findTab(tab){
    ['Headings','Pages','Results'].forEach(function(t){
        const btn = document.getElementById('pp_tab_'+t);
        if(!btn){return;}
        if(t===tab){
            btn.style.borderBottom = '2px solid #2563eb';
            btn.style.color        = '#2563eb';
            btn.style.fontWeight   = 'bold';
        } else {
            btn.style.borderBottom = '2px solid transparent';
            btn.style.color        = '#64748b';
            btn.style.fontWeight   = 'normal';
        }
    });
    window._ppFindTab = tab;
}

function pp_findClear(){
    const inp = document.getElementById('pp_findText');
    const cnt = document.getElementById('pp_findCount');
    const res = document.getElementById('pp_findResults');
    if(inp){ inp.value=''; inp.focus(); }
    if(cnt){ cnt.textContent='Nhập từ khóa để tìm kiếm'; }
    if(res){ res.innerHTML='<div style="color:#94a3b8;font-style:italic;'
        +'text-align:center;margin-top:30px;">Nhập từ khóa để tìm kiếm...</div>'; }
}

/* ── 2. HÀM TỰ ĐỘNG ĐẾM TỪ VÀ TÁCH THÀNH CÁC Ô DÒNG KẾT QUẢ ── */
function pp_findSearch(val, docText, ansText){
    const cnt = document.getElementById('pp_findCount');
    const res = document.getElementById('pp_findResults');
    if(!cnt || !res){ return; }
    
    if(!val.trim()){
        pp_findClear(); 
        return;
    }
    
    const isMatched = ansText && val.toLowerCase() === ansText.toLowerCase();

    if(isMatched){
        const lines = docText.split('\n');
        let snippets = [];

        lines.forEach(function(line){
            const regex = new RegExp(`(${val})`, 'gi');
            const matches = line.match(regex);
            
            if(matches){
                matches.forEach(function(){
                    const formattedLine = line.replace(regex, '<b>$1</b>');
                    snippets.push(formattedLine);
                });
            }
        });

        const total = snippets.length;
        cnt.textContent = `Result 1 of ${total}`;
        cnt.style.color = '#16a34a';

        let htmlContent = '';
        snippets.forEach(function(snippetText, idx){
            const isFirst = (idx === 0);
            htmlContent += `
                <div class="pp-find-item" onclick="pp_selectResultItem(this, ${idx + 1}, ${total})"
                     style="padding:6px 8px;background:${isFirst ? '#eff6ff' : '#ffffff'};
                            border-left:3px solid ${isFirst ? '#2563eb' : '#cbd5e1'};
                            border-radius:2px;cursor:pointer;transition:all 0.15s;">
                    ${snippetText}
                </div>`;
        });
        res.innerHTML = htmlContent;
    } else {
        cnt.textContent = 'No matches';
        cnt.style.color = '#dc2626';
        res.innerHTML   = `<div style="color:#94a3b8;font-style:italic;
            text-align:center;margin-top:30px;">Không tìm thấy kết quả.</div>`;
    }
}

/* Hàm chọn ô kết quả tìm kiếm và cập nhật Result X of Y */
function pp_selectResultItem(el, index, total) {
    const allItems = document.querySelectorAll('.pp-find-item');
    allItems.forEach(function(item) {
        item.style.background = '#ffffff';
        item.style.borderLeft = '3px solid #cbd5e1';
    });
    el.style.background = '#eff6ff';
    el.style.borderLeft = '3px solid #2563eb';

    const cnt = document.getElementById('pp_findCount');
    if(cnt) {
        cnt.textContent = `Result ${index} of ${total}`;
    }
}

function pp_findNav(dir){ /* placeholder điều hướng */ }

function checkFindNavPopup(){
    _hidePopupError('pp_err_find');
    const a    = window._ppAns||{};
    const text = (document.getElementById('pp_findText')||{}).value||'';
    const tab  = window._ppFindTab||'Results';
    let errors=[];
    if(a.searchText!==undefined && text.trim()!==a.searchText)
        errors.push('Search text→"'+a.searchText+'"');
    if(a.tab && tab!==a.tab)
        errors.push('Tab→'+a.tab);
    if(errors.length){_showPopupError('pp_err_find','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

   
/* ============================================================
   28. POPUP INSERT — 3 TAB: Table of Contents / Table of Figures / Table of Authorities
   	//sử dụng tab nào copy tab đó, không cần False của 2 tab còn lại
   ============================================================
 — TAB TABLE OF CONTENTS ──
popupType: 'insert-tof',
popupAnswer: {
     tabTableOfContents: true,
     showPageNumbers:      true,
     rightAlignPageNumbers: true,
     useHyperlinks:        true,
     leaderDots:       true,
     formatFromTemplate: true,
     showLevels: 3 }},

— TAB TABLE OF FIGURES ──
popupType: 'insert-tof',
popupAnswer: {
     tabTableOfFigures: true,
     showPageNumbers:      true,
     rightAlignPageNumbers: true,
     useHyperlinks:        true,
     includeLabelNumber: true
     leaderDash:       true,
     formatFromTemplate: true,
     labelFigure:    true }},

— TAB TABLE OF AUTHORITIES ──
popupType: 'insert-tof',
popupAnswer: {
     tabTableOfAuthorities: true,
     category:          'All',
     showPageNumbers:      true,
     rightAlignPageNumbers: true,
     useHyperlinks:        true,
     keepOriginalFormatting: true,
     leaderDots:       true,
     formatFromTemplate: true }},

   ============================================================
   popupAnswer: {
     // Tab — chỉ 1 cái true
     tabTableOfContents:    false,
     tabTableOfFigures:     false,
     tabTableOfAuthorities: false,

     // Print Preview options — DÙNG CHUNG cho cả 3 tab
     showPageNumbers:      true,
     rightAlignPageNumbers:true,
     useHyperlinks:        false,

     // Tab leader — DÙNG CHUNG, chỉ 1 cái true
     leaderDots:       true,
     leaderDash:       false,
     leaderUnderline:  false,
     leaderNone:       false,

     // Formats — DÙNG CHUNG
     formatFromTemplate: true,
     formatClassic:      false,
     formatDistinctive:  false,
     formatCentered:     false,
     formatFormal:       false,
     formatSimple:       false,

     // ── Riêng tab Table of Contents ──
     showLevels: 3,

     // ── Riêng tab Table of Figures ──
     labelFigure:    true,
     labelTable:     false,
     labelEquation:  false,
     includeLabelNumber: true,

     // ── Riêng tab Table of Authorities ──
     category: 'All',   // 'All'|'Cases'|'Statutes'|'Other Authorities'|'Rules'|'Treaties'|'Regulations'|'Constitutional Provisions'
     keepOriginalFormatting: false,
   }
   Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
/* ── Giá trị hiển thị mặc định khi MỞ popup — CỐ ĐỊNH, không đọc từ ans (tránh lộ đáp án) ── */
const _TOF_DEFAULTS = {
    activeTab: 'tof',
    showPageNumbers: true,
    rightAlignPageNumbers: true,
    useHyperlinks: true,
    leader: 'dots',
    format: 'From template',
    showLevels: 3,
    label: 'Figure',
    includeLabelNumber: true,
    category: 'All',
    keepOriginalFormatting: false,
};

function openInsertTofPopup(step){
    const box = _createPopupShell('Table of Contents');
    const ans = step.popupAnswer || {};

    /* Giải mã các lựa chọn — dùng để CHẤM ĐIỂM, không dùng để hiển thị ban đầu */
    const ansLeader = ans.leaderDash      ? 'dash'
                     : ans.leaderUnderline ? 'underline'
                     : ans.leaderNone      ? 'none'
                     : ans.leaderDots      ? 'dots'
                     : 'none';

    const ansFormat = ans.formatClassic     ? 'Classic'
                     : ans.formatDistinctive ? 'Distinctive'
                     : ans.formatCentered    ? 'Centered'
                     : ans.formatFormal      ? 'Formal'
                     : ans.formatSimple      ? 'Simple'
                     : 'From template';

    const ansLabel  = ans.labelTable    ? 'Table'
                     : ans.labelEquation ? 'Equation'
                     : 'Figure';

    const ansTab    = ans.tabTableOfContents    ? 'toc'
                     : ans.tabTableOfAuthorities ? 'toa'
                     : 'tof';

    window._ppAns = {
        tab:                ansTab,
        showPageNumbers:    ('showPageNumbers'       in ans) ? ans.showPageNumbers       : undefined,
        rightAlignPages:    ('rightAlignPageNumbers' in ans) ? ans.rightAlignPageNumbers  : undefined,
        useHyperlinks:      ('useHyperlinks'         in ans) ? ans.useHyperlinks          : undefined,
        leader:             ansLeader,
        format:             ansFormat,
        showLevels:         ('showLevels'            in ans) ? ans.showLevels             : undefined,
        label:              ansLabel,
        includeLabelNumber: ('includeLabelNumber'    in ans) ? ans.includeLabelNumber     : undefined,
        category:           ('category'              in ans) ? ans.category               : undefined,
        keepOriginalFormatting: ('keepOriginalFormatting' in ans) ? ans.keepOriginalFormatting : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:520px;gap:0;padding:0;';

    /* ── Tab bar — 3 tab ĐỀU CLICK ĐƯỢC ── */
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;border-bottom:1px solid #cbd5e1;background:#f1f5f9;padding:0 8px;';
    const _tofTabs = [
        {key:'toc', label:'Table of Contents'},
        {key:'tof', label:'Table of Figures'},
        {key:'toa', label:'Table of Authorities'},
    ];
    const tabEls = {};
    _tofTabs.forEach(function(t){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = t.label;
        btn.style.cssText = 'padding:6px 14px;font-size:12px;border:none;cursor:pointer;'
            +'border-bottom:2px solid transparent;background:none;color:#64748b;font-weight:normal;';
        btn.addEventListener('click', function(){ pp_tofSetTab(t.key); });
        tabBar.appendChild(btn);
        tabEls[t.key] = btn;
    });
    body.appendChild(tabBar);
    window._ppTofTabEls = tabEls;

    const content = document.createElement('div');
    content.style.cssText = 'padding:12px 14px;';
    body.appendChild(content);

    /* ══ PANEL: TABLE OF CONTENTS (MỚI) ══ */
    const panelTOC = document.createElement('div');
    panelTOC.id = 'pp_tof_panel_toc';
    panelTOC.style.cssText = 'display:none;flex-direction:column;gap:10px;';
    panelTOC.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div>
            <div class="pp-group-title" style="margin-top:0;margin-bottom:6px;">Print Preview</div>
            <div style="border:1px solid #94a3b8;border-radius:3px;background:#fff;padding:8px;
                        font-size:11px;font-family:'Times New Roman',serif;min-height:80px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-weight:bold;">
                    <span>Heading 1</span><span id="pp_toc_previewPageNum">1</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;margin-left:12px;">
                    <span>Heading 2</span><span>2</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-left:24px;">
                    <span>Heading 3</span><span>3</span>
                </div>
            </div>
          </div>
          <div>
            <div class="pp-group-title" style="margin-bottom:6px;">Web Preview</div>
            <div style="border:1px solid #94a3b8;border-radius:3px;background:#fff;padding:8px;
                        font-size:11px;min-height:50px;">
                <div style="color:#2563eb;text-decoration:underline;margin-bottom:3px;cursor:pointer;">Heading 1</div>
                <div style="color:#2563eb;text-decoration:underline;margin-bottom:3px;margin-left:12px;cursor:pointer;">Heading 2</div>
                <div style="color:#2563eb;text-decoration:underline;margin-left:24px;cursor:pointer;">Heading 3</div>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div class="pp-check-group" style="gap:5px;">
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="pp_toc_showPageNums"> Show page numbers
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="pp_toc_rightAlign"> Right align page numbers
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="pp_toc_useHyperlinks"> Use hyperlinks instead of page numbers
            </label>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;margin-top:2px;">
            <label style="font-size:12px;white-space:nowrap;">Tab leader:</label>
            <select id="pp_toc_tabLeader" style="font-size:12px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
                <option value="none">(none)</option>
                <option value="dots">.............. (chấm chấm kiểu Dots)</option>
                <option value="dash">– – – – – (gạch ngang kiểu Hyphen)</option>
                <option value="underline">_ _ _ _ _ (gạch chân kiểu Underline)</option>
            </select>
          </div>
          <div class="pp-group-title" style="margin-top:4px;margin-bottom:4px;">General</div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
            <label style="font-size:12px;">Formats:</label>
            <select id="pp_toc_format" style="font-size:12px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
                <option value="From template">From template</option>
                <option value="Classic">Classic</option>
                <option value="Distinctive">Distinctive</option>
                <option value="Fancy">Fancy</option>
                <option value="Modern">Modern</option>
                <option value="Formal">Formal</option>
                <option value="Simple">Simple</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
            <label style="font-size:12px;white-space:nowrap;">Show levels:</label>
            <input type="number" id="pp_toc_showLevels" min="1" max="9"
                style="width:60px;font-size:12px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e2e8f0;padding-top:8px;">
          <div style="display:flex;gap:6px;">
              <button type="button" class="pp-btn" style="font-size:12px;padding:4px 12px;">Options...</button>
              <button type="button" class="pp-btn" style="font-size:12px;padding:4px 12px;">Modify...</button>
          </div>
      </div>`;
    content.appendChild(panelTOC);

    /* ══ PANEL: TABLE OF FIGURES (giữ nguyên chuẩn cũ) ══ */
    const panelTOF = document.createElement('div');
    panelTOF.id = 'pp_tof_panel_tof';
    panelTOF.style.cssText = 'display:none;flex-direction:column;gap:10px;';
    panelTOF.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div>
            <div class="pp-group-title" style="margin-top:0;margin-bottom:6px;">Print Preview</div>
            <div style="border:1px solid #94a3b8;border-radius:3px;background:#fff;padding:8px;
                        font-size:11px;font-family:'Times New Roman',serif;min-height:80px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                    <span>Figure 1: Chart of sales...</span>
                    <span id="pp_tof_previewPageNum">1</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                    <span>Figure 2: Product photo</span><span>3</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                    <span>Figure 3: Diagram</span><span>5</span>
                </div>
            </div>
          </div>
          <div>
            <div class="pp-group-title" style="margin-bottom:6px;">Web Preview</div>
            <div style="border:1px solid #94a3b8;border-radius:3px;background:#fff;padding:8px;
                        font-size:11px;min-height:50px;">
                <div style="color:#2563eb;text-decoration:underline;margin-bottom:3px;cursor:pointer;">Figure 1: Chart of sales...</div>
                <div style="color:#2563eb;text-decoration:underline;margin-bottom:3px;cursor:pointer;">Figure 2: Product photo</div>
                <div style="color:#2563eb;text-decoration:underline;cursor:pointer;">Figure 3: Diagram</div>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div class="pp-check-group" style="gap:5px;">
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="pp_tof_showPageNums"> Show page numbers
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="pp_tof_rightAlign"> Right align page numbers
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="pp_tof_useHyperlinks"> Use hyperlinks instead of page numbers
            </label>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;margin-top:2px;">
            <label style="font-size:12px;white-space:nowrap;">Tab leader:</label>
            <select id="pp_tof_tabLeader" style="font-size:12px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
                <option value="none">(none)</option>
                <option value="dots">.............. (chấm chấm, kiểu Dots)</option>
                <option value="dash">– – – – – (gạch ngang, kiểu Hyphen)</option>
                <option value="underline">_ _ _ _ _ (gạch chân, kiểu Underline)</option>
            </select>
          </div>
          <div class="pp-group-title" style="margin-top:4px;margin-bottom:4px;">General</div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
            <label style="font-size:12px;">Formats:</label>
            <select id="pp_tof_format" style="font-size:12px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
                <option value="From template">From template</option>
                <option value="Classic">Classic</option>
                <option value="Distinctive">Distinctive</option>
                <option value="Centered">Centered</option>
                <option value="Formal">Formal</option>
                <option value="Simple">Simple</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
            <label style="font-size:12px;white-space:nowrap;">Caption label:</label>
            <select id="pp_tof_captionLabel" style="font-size:12px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
                <option value="none">(none)</option>
                <option value="Figure">Figure</option>
                <option value="Table">Table</option>
                <option value="Equation">Equation</option>
            </select>
          </div>
          <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
              <input type="checkbox" id="pp_tof_includeLabel"> Include label and number
          </label>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e2e8f0;padding-top:8px;">
          <div style="display:flex;gap:6px;">
              <button type="button" class="pp-btn" style="font-size:12px;padding:4px 12px;">Options...</button>
              <button type="button" class="pp-btn" style="font-size:12px;padding:4px 12px;">Modify...</button>
          </div>
      </div>`;
    content.appendChild(panelTOF);

    /* ══ PANEL: TABLE OF AUTHORITIES (MỚI) ══ */
    const panelTOA = document.createElement('div');
    panelTOA.id = 'pp_tof_panel_toa';
    panelTOA.style.cssText = 'display:none;flex-direction:column;gap:10px;';
    panelTOA.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div>
            <div class="pp-group-title" style="margin-top:0;margin-bottom:6px;">Print Preview</div>
            <div style="border:1px solid #94a3b8;border-radius:3px;background:#fff;padding:8px;
                        font-size:11px;font-family:'Times New Roman',serif;min-height:90px;">
                <div style="font-weight:bold;margin-bottom:3px;">Cases</div>
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                    <span>Marbury v. Madison, 5 U.S. 137 (1803)</span>
                    <span id="pp_toa_previewPageNum">1, 3</span>
                </div>
                <div style="font-weight:bold;margin:6px 0 3px;">Statutes</div>
                <div style="display:flex;justify-content:space-between;">
                    <span>28 U.S.C. § 1332</span><span>5</span>
                </div>
            </div>
          </div>
          <div>
            <div class="pp-group-title" style="margin-bottom:6px;">Category:</div>
            <select id="pp_toa_category" style="width:100%;font-size:12px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
                <option value="All">All</option>
                <option value="Cases">Cases</option>
                <option value="Statutes">Statutes</option>
                <option value="Other Authorities">Other Authorities</option>
                <option value="Rules">Rules</option>
                <option value="Treaties">Treaties</option>
                <option value="Regulations">Regulations</option>
                <option value="Constitutional Provisions">Constitutional Provisions</option>
            </select>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div class="pp-check-group" style="gap:5px;">
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="pp_toa_showPageNums"> Show page numbers
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="pp_toa_rightAlign"> Right align page numbers
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="pp_toa_useHyperlinks"> Use hyperlinks instead of page numbers
            </label>
            <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="pp_toa_keepFormatting"> Keep original formatting
            </label>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;margin-top:2px;">
            <label style="font-size:12px;white-space:nowrap;">Tab leader:</label>
            <select id="pp_toa_tabLeader" style="font-size:12px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
                <option value="none">(none)</option>
                <option value="dots">.............. (kiểu Dots, đường chấm chấm)</option>
                <option value="dash">– – – – – (kiểu Hyphen, đường gạch ngang)</option>
                <option value="underline">_ _ _ _ _ (kiểu Underline, đường gạch chân)</option>
            </select>
          </div>
          <div class="pp-group-title" style="margin-top:4px;margin-bottom:4px;">General</div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
            <label style="font-size:12px;">Formats:</label>
            <select id="pp_toa_format" style="font-size:12px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
                <option value="From template">From template</option>
                <option value="Classic">Classic</option>
                <option value="Distinctive">Distinctive</option>
                <option value="Formal">Formal</option>
                <option value="Simple">Simple</option>
            </select>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e2e8f0;padding-top:8px;">
          <div style="display:flex;gap:6px;">
              <button type="button" class="pp-btn" style="font-size:12px;padding:4px 12px;">Mark Citation...</button>
              <button type="button" class="pp-btn" style="font-size:12px;padding:4px 12px;">Category...</button>
          </div>
      </div>`;
    content.appendChild(panelTOA);

    /* ── Error + nút hành động chung (nằm ngoài 3 panel) ── */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_tof';
    errDiv.style.margin = '8px 14px 0';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:6px;padding:10px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()" style="font-size:12px;">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkInsertTofPopup()" style="font-size:12px;">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button').forEach(function(el){
        el.style.fontSize = '14px';
    });

    /* ── Set giá trị hiển thị mặc định — LUÔN dùng _TOF_DEFAULTS, KHÔNG đọc từ ans ── */
    window._ppTofPanels = { toc: panelTOC, tof: panelTOF, toa: panelTOA };
    setTimeout(function(){
        document.getElementById('pp_toc_showPageNums').checked   = _TOF_DEFAULTS.showPageNumbers;
        document.getElementById('pp_toc_rightAlign').checked     = _TOF_DEFAULTS.rightAlignPageNumbers;
        document.getElementById('pp_toc_useHyperlinks').checked  = _TOF_DEFAULTS.useHyperlinks;
        document.getElementById('pp_toc_tabLeader').value        = _TOF_DEFAULTS.leader;
        document.getElementById('pp_toc_format').value           = _TOF_DEFAULTS.format;
        document.getElementById('pp_toc_showLevels').value       = _TOF_DEFAULTS.showLevels;

        document.getElementById('pp_tof_showPageNums').checked   = _TOF_DEFAULTS.showPageNumbers;
        document.getElementById('pp_tof_rightAlign').checked     = _TOF_DEFAULTS.rightAlignPageNumbers;
        document.getElementById('pp_tof_useHyperlinks').checked  = _TOF_DEFAULTS.useHyperlinks;
        document.getElementById('pp_tof_tabLeader').value        = _TOF_DEFAULTS.leader;
        document.getElementById('pp_tof_format').value           = _TOF_DEFAULTS.format;
        document.getElementById('pp_tof_captionLabel').value     = _TOF_DEFAULTS.label;
        document.getElementById('pp_tof_includeLabel').checked   = _TOF_DEFAULTS.includeLabelNumber;

        document.getElementById('pp_toa_showPageNums').checked   = _TOF_DEFAULTS.showPageNumbers;
        document.getElementById('pp_toa_rightAlign').checked     = _TOF_DEFAULTS.rightAlignPageNumbers;
        document.getElementById('pp_toa_useHyperlinks').checked  = _TOF_DEFAULTS.useHyperlinks;
        document.getElementById('pp_toa_keepFormatting').checked = _TOF_DEFAULTS.keepOriginalFormatting;
        document.getElementById('pp_toa_tabLeader').value        = _TOF_DEFAULTS.leader;
        document.getElementById('pp_toa_format').value           = _TOF_DEFAULTS.format;
        document.getElementById('pp_toa_category').value         = _TOF_DEFAULTS.category;

        /* Toggle preview số trang khi bật/tắt Right align — áp cho cả 3 tab */
        ['toc','tof','toa'].forEach(function(prefix){
            const chk = document.getElementById('pp_'+prefix+'_rightAlign');
            const pn  = document.getElementById('pp_'+prefix+'_previewPageNum');
            if(chk && pn){
                pn.style.display = chk.checked ? '' : 'none';
                chk.addEventListener('change', function(){ pn.style.display = chk.checked ? '' : 'none'; });
            }
        });

        pp_tofSetTab(_TOF_DEFAULTS.activeTab);
    }, 0);
}

/* ── Chuyển tab (Table of Contents / Table of Figures / Table of Authorities) ── */
function pp_tofSetTab(tab){
    const tabEls = window._ppTofTabEls || {};
    ['toc','tof','toa'].forEach(function(t){
        const el = tabEls[t];
        if(!el){ return; }
        if(t===tab){
            el.style.borderBottom = '2px solid #2563eb';
            el.style.color        = '#2563eb';
            el.style.fontWeight   = 'bold';
        } else {
            el.style.borderBottom = '2px solid transparent';
            el.style.color        = '#64748b';
            el.style.fontWeight   = 'normal';
        }
    });
    const panels = window._ppTofPanels || {};
    ['toc','tof','toa'].forEach(function(t){
        const p = panels[t];
        if(p){ p.style.display = (t===tab) ? 'flex' : 'none'; }
    });
    window._ppTofActiveTab = tab;
}

function checkInsertTofPopup(){
    _hidePopupError('pp_err_tof');
    const a   = window._ppAns||{};
    const tab = window._ppTofActiveTab || 'tof';

    let errors = [];

    if(a.tab && tab !== a.tab){
        const tabNames = {toc:'Table of Contents', tof:'Table of Figures', toa:'Table of Authorities'};
        errors.push('Tab→'+(tabNames[a.tab]||a.tab));
        _showPopupError('pp_err_tof','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }

    const showPg   = (document.getElementById('pp_'+tab+'_showPageNums')  ||{}).checked;
    const rightAl  = (document.getElementById('pp_'+tab+'_rightAlign')    ||{}).checked;
    const useHyper = (document.getElementById('pp_'+tab+'_useHyperlinks') ||{}).checked;
    const leader   = (document.getElementById('pp_'+tab+'_tabLeader')     ||{}).value||'';
    const format   = (document.getElementById('pp_'+tab+'_format')       ||{}).value||'';

    if(a.showPageNumbers  !==undefined&&showPg  !==a.showPageNumbers)   errors.push('Show page numbers→'+a.showPageNumbers);
    if(a.rightAlignPages  !==undefined&&rightAl !==a.rightAlignPages)   errors.push('Right align→'+a.rightAlignPages);
    if(a.useHyperlinks    !==undefined&&useHyper!==a.useHyperlinks)     errors.push('Use hyperlinks→'+a.useHyperlinks);
    if(a.leader           && leader!==a.leader)                          errors.push('Tab leader→'+a.leader);
    if(a.format           && format!==a.format)                          errors.push('Formats→'+a.format);

    if(tab==='toc'){
        const lvl = parseInt((document.getElementById('pp_toc_showLevels')||{}).value)||0;
        if(a.showLevels!==undefined&&(isNaN(lvl)||lvl!==a.showLevels)) errors.push('Show levels→'+a.showLevels);
    }

    if(tab==='tof'){
        const label   = (document.getElementById('pp_tof_captionLabel') ||{}).value||'';
        const inclLbl = (document.getElementById('pp_tof_includeLabel') ||{}).checked;
        if(a.label && label !==a.label)                                             errors.push('Caption label→'+a.label);
        if(a.includeLabelNumber!==undefined&&inclLbl!==a.includeLabelNumber)        errors.push('Include label→'+a.includeLabelNumber);
    }

    if(tab==='toa'){
        const category   = (document.getElementById('pp_toa_category')       ||{}).value||'';
        const keepFormat = (document.getElementById('pp_toa_keepFormatting') ||{}).checked;
        if(a.category && category !==a.category)                                    errors.push('Category→'+a.category);
        if(a.keepOriginalFormatting!==undefined&&keepFormat!==a.keepOriginalFormatting) errors.push('Keep original formatting→'+a.keepOriginalFormatting);
    }

    if(errors.length){
        _showPopupError('pp_err_tof','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }
    closeMosPopup(); checkCorrect();
}


/* ============================================================
29. POPUP UPDATE TABLE OF CONTENTS //copy đoạn đáp án sau vào HTML
   ============================================================
popupType: 'update-table',   
popupAnswer: {
     updatePageOnly:   false,   
     updateEntireTable: true }},
============================================================ */
function openUpdateTablePopup(step){
    const box = _createPopupShell('Update Table of Contents');
    const ans = step.popupAnswer || {};
    const ansUpdate = ans.updateEntireTable ? 'entire' : 'page';
    window._ppAns = { update: ansUpdate };
    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:320px;gap:10px;padding:14px 16px;';
    body.innerHTML = `
    <!-- Thông báo -->
    <div style="font-size:14px;color:#374151;line-height:1.6;
                background:#eff6ff;border:1px solid #bfdbfe;
                border-radius:4px;padding:8px 10px;">
        Word is updating the table of contents.<br>
        Select one of the following options:
    </div>

    <!-- Radio options -->
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:2px;">
        <label style="display:flex;align-items:flex-start;gap:10px;
                      font-size:14px;cursor:pointer;">
            <input type="radio" name="pp_updateToc" value="page"
                style="margin-top:3px;cursor:pointer;" checked>
            <div>
                <div style="font-weight:500;color:#1f2937;">
                    Update page numbers only
                </div>
                <div style="font-size:14px;color:#6b7280;margin-top:2px;">
                    Updates only the page numbers for headings already in the table.
                </div>
            </div>
        </label>

        <label style="display:flex;align-items:flex-start;gap:10px;
                      font-size:14px;cursor:pointer;">
            <input type="radio" name="pp_updateToc" value="entire"
                style="margin-top:3px;cursor:pointer;">
            <div>
                <div style="font-weight:500;color:#1f2937;">
                    Update entire table
                </div>
                <div style="font-size:14px;color:#6b7280;margin-top:2px;">
                    Updates the entire table including any text changes in the headings.
                </div>
            </div>
        </label>
    </div>

    <div class="pp-error" id="pp_err_updatetoc"></div>
    <div class="pp-btn-row">
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkUpdateTablePopup()">OK</button>
    </div>`;
    box.appendChild(body);

    /* Set mặc định không chọn gì — học sinh tự chọn */
    setTimeout(function(){
        document.querySelectorAll('input[name="pp_updateToc"]')
            .forEach(function(r){ r.checked = false; });
    }, 30);

}

function checkUpdateTablePopup(){
    _hidePopupError('pp_err_updatetoc');
    const a       = window._ppAns||{};
    const checked = document.querySelector('input[name="pp_updateToc"]:checked');
    const val     = checked ? checked.value : '';

    if(!val){
        _showPopupError('pp_err_updatetoc','⚠️ Hãy chọn 1 tùy chọn trước khi nhấn OK.');
        return;
    }
    if(a.update && val !== a.update){
        const names = { page:'Update page numbers only', entire:'Update entire table' };
        _showPopupError('pp_err_updatetoc','❌ Chưa đúng! Yêu cầu chọn: '+names[a.update]);
        return;
    }
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   30. POPUP SORT — copy vào HTML
popupType: 'sort',
popupAnswer: {
	sortBy1:        'Time',        
	sortType1:      'Text',        
	sortUsing1:     'Paragraphs', 
	sortOrder1:     'Ascending',  
	headerRow:      true } },
   ============================================================
   popupType: 'sort',
   popupAnswer: {
     // Sort by (hàng đầu tiên)
     sortBy1:        'Time',        // tên cột/field Sort by
     sortType1:      'Text',        // Text | Number | Date
     sortUsing1:     'Paragraphs',  // Paragraphs | Fields
     sortOrder1:     'Ascending',   // Ascending | Descending

     // Then by — hàng 2 (để trống nếu không dùng)
     sortBy2:        'Division',
     sortType2:      'Text',
     sortUsing2:     'Paragraphs',
     sortOrder2:     'Ascending',

     // Then by — hàng 3 (để trống nếu không dùng)
     sortBy3:        'Levels',
     sortType3:      'Text',
     sortUsing3:     'Paragraphs',
     sortOrder3:     'Ascending',

     // My list has
     headerRow:      true,          // true = Header row | false = No header row
   }
============================================================ */
function openSortPopup(step){
    var box = _createPopupShell('Sort');
    var ans = step.popupAnswer || {};

    /* ── Giá trị đáp án ── */
    var a = {
        by1:     ans.sortBy1    || '',
        type1:   ans.sortType1  || 'Text',
        using1:  ans.sortUsing1 || 'Paragraphs',
        order1:  ans.sortOrder1 || 'Ascending',

        by2:     ans.sortBy2    || '',
        type2:   ans.sortType2  || 'Text',
        using2:  ans.sortUsing2 || 'Paragraphs',
        order2:  ans.sortOrder2 || 'Ascending',

        by3:     ans.sortBy3    || '',
        type3:   ans.sortType3  || 'Text',
        using3:  ans.sortUsing3 || 'Paragraphs',
        order3:  ans.sortOrder3 || 'Ascending',

        header:  ans.headerRow !== false,
    };
    window._ppAns = a;

    /* ── CSS chung cho popup ── */
    var S = {
        label:  'font-size:13px;font-weight:600;color:#374151;',
        sel:    'font-size:13px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;background:#fff;min-width:0;',
        radio:  'margin-right:4px;',
        sect:   'background:#f1f5f9;border:1px solid #d1d5db;border-radius:4px;padding:8px 10px;margin-bottom:6px;',
        row:    'display:grid;grid-template-columns:130px 1fr 1fr 140px;gap:6px;align-items:center;',
    };

    /* ── Body — scroll nếu cao hơn khung ── */
    var body = document.createElement('div');
    body.style.cssText = 'min-width:480px;max-width:560px;font-family:Arial,sans-serif;';

    var inner = document.createElement('div');
    inner.style.cssText = 'padding:14px 16px;display:flex;flex-direction:column;gap:6px;'
        +'max-height:70vh;overflow-y:auto;';
    body.appendChild(inner);

    /* ── Hàng tiêu đề cột ── */
    var header = document.createElement('div');
    header.style.cssText = S.row + ';margin-bottom:2px;';
    header.innerHTML = '<span></span>'
        +'<span style="'+S.label+'text-align:center;">Type</span>'
        +'<span style="'+S.label+'text-align:center;">Using</span>'
        +'<span style="'+S.label+'text-align:center;">Order</span>';
    inner.appendChild(header);

    /* ── Hàm tạo 1 nhóm Sort by / Then by ── */
    function makeGroup(label, idPfx, defBy, defType, defUsing, defOrder){
        var wrap = document.createElement('div');
        wrap.style.cssText = S.sect;

        /* Label section */
        var lbl = document.createElement('div');
        lbl.style.cssText = S.label + 'margin-bottom:6px;';
        lbl.textContent = label;
        wrap.appendChild(lbl);

        /* Dòng 1: Sort by / field name + Type + Using + Order radio */
        var row = document.createElement('div');
        row.style.cssText = S.row;

        /* Cột 1: dropdown Sort field */
        var selBy = document.createElement('select');
        selBy.id = idPfx + '_by';
        selBy.style.cssText = S.sel + 'width:100%;';
        ['(none)','Column 1','Column 2','Column 3',
         'Time','Division','Levels','Name','Date','Amount'].forEach(function(v){
            var o = document.createElement('option');
            o.value = v; o.textContent = v;
            if(v === defBy) o.selected = true;
            selBy.appendChild(o);
        });
        row.appendChild(selBy);

        /* Cột 2: Type */
        var selType = document.createElement('select');
        selType.id = idPfx + '_type';
        selType.style.cssText = S.sel + 'width:100%;';
        ['Text','Number','Date'].forEach(function(v){
            var o = document.createElement('option');
            o.value = v; o.textContent = v;
            if(v === defType) o.selected = true;
            selType.appendChild(o);
        });
        row.appendChild(selType);

        /* Cột 3: Using */
        var selUsing = document.createElement('select');
        selUsing.id = idPfx + '_using';
        selUsing.style.cssText = S.sel + 'width:100%;';
        ['Paragraphs','Fields'].forEach(function(v){
            var o = document.createElement('option');
            o.value = v; o.textContent = v;
            if(v === defUsing) o.selected = true;
            selUsing.appendChild(o);
        });
        row.appendChild(selUsing);

        /* Cột 4: Ascending / Descending radio */
        var radioWrap = document.createElement('div');
        radioWrap.style.cssText = 'display:flex;flex-direction:column;gap:3px;';

        var rAsc  = _mkRadio(idPfx+'_ord', 'Ascending',  defOrder==='Ascending');
        var rDesc = _mkRadio(idPfx+'_ord', 'Descending', defOrder==='Descending');
        radioWrap.appendChild(rAsc);
        radioWrap.appendChild(rDesc);
        row.appendChild(radioWrap);

        wrap.appendChild(row);
        return wrap;
    }

    function _mkRadio(name, value, checked){
        var lbl = document.createElement('label');
        lbl.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;';
        var inp = document.createElement('input');
        inp.type='radio'; inp.name=name; inp.value=value; inp.checked=checked;
        inp.style.cssText = S.radio;
        lbl.appendChild(inp);
        lbl.appendChild(document.createTextNode(value));
        return lbl;
    }

    /* ── 3 nhóm Sort by / Then by / Then by ──
       Giá trị hiển thị mặc định khi MỞ popup — CỐ ĐỊNH, không đọc từ a (tránh lộ đáp án) */
    inner.appendChild(makeGroup('Sort by',  'pp_sort1', '(none)', 'Text', 'Paragraphs', 'Ascending'));
    inner.appendChild(makeGroup('Then by',  'pp_sort2', '(none)', 'Text', 'Paragraphs', 'Ascending'));
    inner.appendChild(makeGroup('Then by',  'pp_sort3', '(none)', 'Text', 'Paragraphs', 'Ascending'));

    /* ── My list has ── */
    var myList = document.createElement('div');
    myList.style.cssText = 'display:flex;align-items:center;gap:16px;padding:6px 2px;';
    var myLabel = document.createElement('span');
    myLabel.style.cssText = S.label;
    myLabel.textContent = 'My list has';
    myList.appendChild(myLabel);

    var rHdr   = _mkRadio('pp_sort_hdr', 'Header row',    true);
    var rNoHdr = _mkRadio('pp_sort_hdr', 'No header row', false);
    myList.appendChild(rHdr);
    myList.appendChild(rNoHdr);
    inner.appendChild(myList);

    /* ── Error ── */
    var errDiv = document.createElement('div');
    errDiv.id = 'pp_err_sort';
    errDiv.className = 'pp-error';
    errDiv.style.margin = '0 16px 6px';
    body.appendChild(errDiv);

    /* ── Nút hành động ── */
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;'
        +'padding:10px 16px;border-top:1px solid #e2e8f0;gap:8px;';

    var btnOptions = document.createElement('button');
    btnOptions.textContent = 'Options...';
    btnOptions.className = 'pp-btn';
    btnOptions.style.cssText = 'font-size:13px;padding:5px 14px;';
    btnOptions.onclick = function(){ _showPopupError('pp_err_sort','ℹ️ Chức năng Options không cần thiết cho bài thi.'); };

    var rightBtns = document.createElement('div');
    rightBtns.style.cssText = 'display:flex;gap:8px;';

    var btnOK = document.createElement('button');
    btnOK.textContent = 'OK';
    btnOK.className = 'pp-btn pp-btn-ok';
    btnOK.style.cssText = 'font-size:13px;padding:5px 20px;';
    btnOK.onclick = function(){ checkSortPopup(); };

    var btnCancel = document.createElement('button');
    btnCancel.textContent = 'Cancel';
    btnCancel.className = 'pp-btn pp-btn-cancel';
    btnCancel.style.cssText = 'font-size:13px;padding:5px 14px;';
    btnCancel.onclick = function(){ closeMosPopup(); };

    rightBtns.appendChild(btnOK);
    rightBtns.appendChild(btnCancel);
    btnRow.appendChild(btnOptions);
    btnRow.appendChild(rightBtns);
    body.appendChild(btnRow);

    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '14px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});
}

/* ── Hàm đọc giá trị radio group ── */
function _sortGetRadio(name){
    var els = document.querySelectorAll('input[name="'+name+'"]');
    for(var i=0;i<els.length;i++){ if(els[i].checked) return els[i].value; }
    return '';
}

/* ── Kiểm tra đáp án Sort ── */
function checkSortPopup(){
    _hidePopupError('pp_err_sort');
    var a = window._ppAns;
    var errors = [];

    function chk(idPfx, aBy, aType, aUsing, aOrder, rowLabel){
        if(!aBy) return; /* Nếu đáp án row này rỗng → bỏ qua */
        var vBy    = document.getElementById(idPfx+'_by')    ? document.getElementById(idPfx+'_by').value    : '';
        var vType  = document.getElementById(idPfx+'_type')  ? document.getElementById(idPfx+'_type').value  : '';
        var vUsing = document.getElementById(idPfx+'_using') ? document.getElementById(idPfx+'_using').value : '';
        var vOrder = _sortGetRadio(idPfx+'_ord');

        if(vBy    !== aBy)    errors.push(rowLabel+': Sort field cần là "'+aBy+'"');
        if(vType  !== aType)  errors.push(rowLabel+': Type cần là "'+aType+'"');
        if(vUsing !== aUsing) errors.push(rowLabel+': Using cần là "'+aUsing+'"');
        if(vOrder !== aOrder) errors.push(rowLabel+': Order cần là "'+aOrder+'"');
    }

    chk('pp_sort1', a.by1, a.type1, a.using1, a.order1, 'Sort by');
    chk('pp_sort2', a.by2, a.type2, a.using2, a.order2, 'Then by (2)');
    chk('pp_sort3', a.by3, a.type3, a.using3, a.order3, 'Then by (3)');

    /* Header row */
    var vHdr = _sortGetRadio('pp_sort_hdr');
    var aHdr = a.header ? 'Header row' : 'No header row';
    if(vHdr !== aHdr) errors.push('My list has: cần chọn "'+aHdr+'"');

    if(errors.length){
        _showPopupError('pp_err_sort','❌ Chưa đúng:<br>• '+errors.join('<br>• '));
        return;
    }

    closeMosPopup();
    checkCorrect();
}

/* ============================================================
   31. POPUP BORDERS AND SHADING — copy vào HTML
	//activeTab: 'Borders' -> chỉnh applyTo: 'Paragraph','Text'
popupType: 'borders-shading',
popupAnswer: {
	activeTab:    'Page Border',
     	setting:      'Box',
     	style:        'solid',  
     	color:        'Automatic',  
     	width:        '¼ pt',
     	art:          '(none)',  
     	applyTo:      'Whole document' }},
   ============================================================
   popupType: 'borders-shading',
   popupAnswer: {
     // Tab cần chọn: 'Borders' | 'Page Border'
     activeTab:    'Page Border',

     // Setting (chọn 1): 'None'|'Box'|'Shadow'|'3-D'|'Custom'
     setting:      'Box',

     // Style — tên kiểu đường kẻ (hiển thị trong list)
     style:        'solid',      // 'solid'|'dotted'|'dashed'|'double'|'dot-dash'

     // Color
     color:        'Automatic',  // 'Automatic' hoặc tên màu

     // Width
     width:        '¼ pt',       // '¼ pt'|'½ pt'|'¾ pt'|'1 pt'|'1½ pt'|'2¼ pt'|'3 pt'|'4½ pt'|'6 pt'

     // Art (chỉ Page Border)
     art:          '(none)',     // '(none)' hoặc tên art

     // Apply to
     applyTo:      'Whole document', // Borders: 'Paragraph'|'Text'|'Table'|'Cell'
                                     // Page Border: 'Whole document'|'This section'|...
   }
============================================================ */
function openBordersShadingPopup(step){
    var box = _createPopupShell('Borders and Shading');
    var ans = step.popupAnswer || {};
    var a = {
        activeTab: ans.activeTab || 'Borders',
        setting:   ans.setting   || 'None',
        style:     ans.style     || 'solid',
        color:     ans.color     || 'Automatic',
        width:     ans.width     || '½ pt',
        art:       ans.art       || '(none)',
        applyTo:   ans.applyTo   || 'Paragraph',
    };
    window._ppAns = a;

    /* ── Body ── */
    var body = document.createElement('div');
    body.style.cssText = 'font-family:Arial,sans-serif;font-size:13px;';
    box.style.width    = '98%';
    box.style.maxWidth = '680px';
    /* ── Tab bar ── */
    var tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;gap:0;border-bottom:2px solid #94a3b8;'
        +'padding:0 12px;background:#f1f5f9;';

    var tabs = ['Borders','Page Border','Shading'];
    var tabEls = {};
    tabs.forEach(function(t){
        var td = document.createElement('div');
        td.id = 'pp_bs_tab_'+t.replace(/ /g,'_');
        td.textContent = t;
        td.style.cssText = 'padding:7px 14px;cursor:pointer;font-size:13px;border:1px solid transparent;'
            +'border-bottom:none;margin-bottom:-2px;border-radius:3px 3px 0 0;color:#374151;';
        td.addEventListener('click', function(){ pp_bsSetTab(t); });
        tabBar.appendChild(td);
        tabEls[t] = td;
    });
    body.appendChild(tabBar);

    /* ── Content area — scroll nếu cao ── */
    var content = document.createElement('div');
    content.style.cssText = 'padding:14px 16px;max-height:65vh;overflow-y:auto;';
    body.appendChild(content);

    /* ── Hàm render 1 tab (Borders hoặc Page Border) ── */
    function renderBorderTab(isPageBorder){
        content.innerHTML = '';

        /* Layout 3 cột: Setting | Style+Color+Width+Art | Preview */
        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:100px 1fr 140px;gap:12px;';

        /* ── CỘT 1: Setting ── */
        var colSetting = document.createElement('div');
        var lblS = document.createElement('div');
        lblS.textContent = 'Setting:';
        lblS.style.cssText = 'font-weight:600;margin-bottom:6px;';
        colSetting.appendChild(lblS);

        var settings = ['None','Box','Shadow','3-D','Custom'];
        settings.forEach(function(s){
            var item = document.createElement('div');
            item.id = 'pp_bs_set_'+s;
            item.style.cssText = 'display:flex;flex-direction:column;align-items:center;'
                +'gap:3px;padding:5px;cursor:pointer;border:2px solid transparent;'
                +'border-radius:4px;margin-bottom:3px;';
            /* Icon SVG giả lập từng setting */
            var icons = {
                'None':   '<svg width="28" height="24" viewBox="0 0 28 24"><rect x="2" y="2" width="24" height="20" fill="white" stroke="#ccc" stroke-width="1"/></svg>',
                'Box':    '<svg width="28" height="24" viewBox="0 0 28 24"><rect x="2" y="2" width="24" height="20" fill="white" stroke="#333" stroke-width="2"/></svg>',
                'Shadow': '<svg width="28" height="24" viewBox="0 0 28 24"><rect x="4" y="4" width="24" height="20" fill="#ccc"/><rect x="2" y="2" width="24" height="20" fill="white" stroke="#333" stroke-width="2"/></svg>',
                '3-D':    '<svg width="28" height="24" viewBox="0 0 28 24"><rect x="2" y="2" width="24" height="20" fill="white" stroke="#888" stroke-width="3"/><rect x="2" y="2" width="24" height="20" fill="none" stroke="#333" stroke-width="1"/></svg>',
                'Custom': '<svg width="28" height="24" viewBox="0 0 28 24"><rect x="2" y="2" width="24" height="20" fill="white" stroke="#ccc" stroke-width="1"/><line x1="2" y1="2" x2="26" y2="2" stroke="#333" stroke-width="2"/></svg>',
            };
            item.innerHTML = (icons[s]||'')
                +'<span style="font-size:11px;">'+s+'</span>';
            item.addEventListener('click', function(){
                window._ppBsSetting = s;
                document.querySelectorAll('[id^="pp_bs_set_"]').forEach(function(el){
                    el.style.border = '2px solid transparent';
                });
                item.style.border = '2px solid #2563eb';
                item.style.background = '#eff6ff';
            });
            /* Highlight mặc định — CỐ ĐỊNH 'None', không đọc từ a (tránh lộ đáp án) */
            if(s === 'None'){
                item.style.border = '2px solid #2563eb';
                item.style.background = '#eff6ff';
                window._ppBsSetting = s;
            }
            colSetting.appendChild(item);
        });
        grid.appendChild(colSetting);

        /* ── CỘT 2: Style, Color, Width, Art ── */
        var colMiddle = document.createElement('div');
        colMiddle.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

        /* Style list */
        var lblStyle = document.createElement('div');
        lblStyle.textContent = 'Style:';
        lblStyle.style.cssText = 'font-weight:600;';
        colMiddle.appendChild(lblStyle);

        var styleList = document.createElement('select');
        styleList.id = 'pp_bs_style';
        styleList.size = 5;
        styleList.style.cssText = 'width:100%;font-size:13px;border:1px solid #94a3b8;'
            +'border-radius:3px;padding:2px;height:90px;';
        var styles = [
            {val:'solid',   label:	'─────── (đường solid)'},
            {val:'dotted',  label:	'··············· (đường dotted)'},
            {val:'dashed',  label:	'- - - - - - - - -(đường dashed)'},
            {val:'double',  label:	'═══════ (đường double)'},
            {val:'dot-dash',label:	'─·─·─·─·─ (đường dot-dash)'},
        ];
        styles.forEach(function(s){
            var o = document.createElement('option');
            o.value = s.val; o.textContent = s.label;
            if(s.val === 'solid') o.selected = true;
            styleList.appendChild(o);
        });
        colMiddle.appendChild(styleList);

        /* Color */
        var lblColor = document.createElement('div');
        lblColor.textContent = 'Color:';
        lblColor.style.cssText = 'font-weight:600;margin-top:4px;';
        colMiddle.appendChild(lblColor);

        var selColor = document.createElement('select');
        selColor.id = 'pp_bs_color';
        selColor.style.cssText = 'width:100%;font-size:13px;padding:4px;border:1px solid #94a3b8;border-radius:3px;';
        ['Automatic','Black','Blue','Red','Green','Yellow','White','Gray','Blue, Accent 5','Green, Accent 6'].forEach(function(c){
            var o = document.createElement('option');
            o.value = c; o.textContent = c;
            if(c === 'Automatic') o.selected = true;
            selColor.appendChild(o);
        });
        colMiddle.appendChild(selColor);

        /* Width */
        var lblWidth = document.createElement('div');
        lblWidth.textContent = 'Width:';
        lblWidth.style.cssText = 'font-weight:600;margin-top:4px;';
        colMiddle.appendChild(lblWidth);

        var selWidth = document.createElement('select');
        selWidth.id = 'pp_bs_width';
        selWidth.style.cssText = 'width:100%;font-size:13px;padding:4px;border:1px solid #94a3b8;border-radius:3px;';
        ['¼ pt','½ pt','¾ pt','1 pt','1½ pt','2¼ pt','3 pt','4½ pt','6 pt'].forEach(function(w){
            var o = document.createElement('option');
            o.value = w; o.textContent = w;
            if(w === '½ pt') o.selected = true;
            selWidth.appendChild(o);
        });
        colMiddle.appendChild(selWidth);

        /* Art — chỉ hiện ở tab Page Border */
        if(isPageBorder){
            var lblArt = document.createElement('div');
            lblArt.textContent = 'Art:';
            lblArt.style.cssText = 'font-weight:600;margin-top:4px;';
            colMiddle.appendChild(lblArt);

            var selArt = document.createElement('select');
            selArt.id = 'pp_bs_art';
            selArt.style.cssText = 'width:100%;font-size:13px;padding:4px;border:1px solid #94a3b8;border-radius:3px;';
            ['(none)','Apple','Balloon','BabyRattle','BabyPacifier',
             'Diamonds','Hearts','Stars','Leaves','Flowers'].forEach(function(ar){
                var o = document.createElement('option');
                o.value = ar; o.textContent = ar;
                if(ar === '(none)') o.selected = true;
                selArt.appendChild(o);
            });
            colMiddle.appendChild(selArt);
        }

        grid.appendChild(colMiddle);

        /* ── CỘT 3: Preview ── */
        var colPreview = document.createElement('div');
        colPreview.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
        var lblPrev = document.createElement('div');
        lblPrev.textContent = 'Preview';
        lblPrev.style.cssText = 'font-weight:600;';
        colPreview.appendChild(lblPrev);

        var prevBox = document.createElement('div');
        prevBox.style.cssText = 'width:120px;height:100px;border:2px solid #94a3b8;'
            +'background:#fff;display:flex;align-items:center;justify-content:center;'
            +'position:relative;border-radius:2px;';
        prevBox.innerHTML = '<div style="font-size:10px;color:#9ca3af;text-align:center;padding:4px;">'
            +'Click on diagram below<br>to add/remove border</div>';
        colPreview.appendChild(prevBox);

        /* Apply to */
        var lblApply = document.createElement('div');
        lblApply.textContent = 'Apply to:';
        lblApply.style.cssText = 'font-weight:600;margin-top:6px;';
        colPreview.appendChild(lblApply);

        var selApply = document.createElement('select');
        selApply.id = 'pp_bs_applyto';
        selApply.style.cssText = 'width:100%;font-size:13px;padding:4px;border:1px solid #94a3b8;border-radius:3px;';
        var applyOptions = isPageBorder
            ? ['Whole document','This section','This section - First page only','This section - All except first page']
            : ['Paragraph','Text'];
        applyOptions.forEach(function(ap){
            var o = document.createElement('option');
            o.value = ap; o.textContent = ap;
            if(ap === (isPageBorder ? 'Whole document' : 'Paragraph')) o.selected = true;
            selApply.appendChild(o);
        });
        colPreview.appendChild(selApply);

        grid.appendChild(colPreview);
        content.appendChild(grid);
    }

    /* ── Hàm chuyển tab ── */
    window.pp_bsSetTab = function(tab){
        window._ppBsActiveTab = tab;
        /* Style tab buttons */
        tabs.forEach(function(t){
            var el = tabEls[t];
            if(t === tab){
                el.style.background = '#fff';
                el.style.border = '1px solid #94a3b8';
                el.style.borderBottom = '2px solid #fff';
                el.style.fontWeight = '600';
                el.style.color = '#1e3a5f';
            } else {
                el.style.background = '';
                el.style.border = '1px solid transparent';
                el.style.fontWeight = '';
                el.style.color = '#374151';
            }
        });
        if(tab === 'Borders')     { renderBorderTab(false); }
        else if(tab==='Page Border'){ renderBorderTab(true); }
        else {
            /* Shading tab — đơn giản */
            content.innerHTML = '<div style="padding:20px;color:#64748b;font-size:13px;">'
                +'Shading: Tính năng này không cần thiết cho bài thi MOS.</div>';
        }
    };
    window._ppBsActiveTab = 'Borders';
    window._ppBsSetting   = 'None';

    /* ── Error ── */
    var errDiv = document.createElement('div');
    errDiv.id = 'pp_err_borders';
    errDiv.className = 'pp-error';
    errDiv.style.margin = '0 16px 4px';
    body.appendChild(errDiv);

    /* ── Nút OK / Cancel ── */
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;'
        +'padding:10px 16px;border-top:1px solid #e2e8f0;';
    var btnOK = document.createElement('button');
    btnOK.textContent = 'OK';
    btnOK.className = 'pp-btn pp-btn-ok';
    btnOK.onclick = function(){ checkBordersShadingPopup(); };
    var btnCancel = document.createElement('button');
    btnCancel.textContent = 'Cancel';
    btnCancel.className = 'pp-btn pp-btn-cancel';
    btnCancel.onclick = function(){ closeMosPopup(); };
    btnRow.appendChild(btnOK);
    btnRow.appendChild(btnCancel);
    body.appendChild(btnRow);

    box.appendChild(body);
    window._ppFindAction = '';
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '14px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});

    /* Kích hoạt tab đúng ngay khi mở */
    setTimeout(function(){ window.pp_bsSetTab('Borders'); }, 0);
}

/* ── Kiểm tra đáp án Borders and Shading ── */
function checkBordersShadingPopup(){
    _hidePopupError('pp_err_borders');
    var a = window._ppAns;
    var errors = [];

    /* Tab */
    if(window._ppBsActiveTab !== a.activeTab)
        errors.push('Tab: cần chọn "'+a.activeTab+'"');

    /* Setting */
    if(window._ppBsSetting !== a.setting)
        errors.push('Setting: cần chọn "'+a.setting+'"');

    /* Style */
    var vStyle = document.getElementById('pp_bs_style');
    if(vStyle && vStyle.value !== a.style)
        errors.push('Style: cần chọn "'+a.style+'"');

    /* Color */
    var vColor = document.getElementById('pp_bs_color');
    if(vColor && vColor.value !== a.color)
        errors.push('Color: cần là "'+a.color+'"');

    /* Width */
    var vWidth = document.getElementById('pp_bs_width');
    if(vWidth && vWidth.value !== a.width)
        errors.push('Width: cần là "'+a.width+'"');

    /* Art (Page Border only) */
    var vArt = document.getElementById('pp_bs_art');
    if(vArt && a.art && vArt.value !== a.art)
        errors.push('Art: cần là "'+a.art+'"');

    /* Apply to */
    var vApply = document.getElementById('pp_bs_applyto');
    if(vApply && vApply.value !== a.applyTo)
        errors.push('Apply to: cần là "'+a.applyTo+'"');

    if(errors.length){
        _showPopupError('pp_err_borders','❌ Chưa đúng:<br>• '+errors.join('<br>• '));
        return;
    }
    closeMosPopup();
    checkCorrect();
}


/* ============================================================
   33. POPUP AUTOCORRECT OPTIONS — copy vào HTML
popupType: 'autocorrect',
popupAnswer: {
    	activeTab: 'AutoCorrect',
    	replaceTextAsYouType: true,
    	replaceText: '',
    	replaceWith: '' }},
    // hoặc đơn giản là bỏ hẳn 2 dòng replaceText/replaceWith này, kết quả giống hệt nhau
popupAnswer: {
    activeTab: 'AutoCorrect',
    replaceText: 'teh',
    replaceWith: 'the' }},
   ============================================================
   popupType: 'autocorrect',
   popupAnswer: {
     activeTab: 'AutoCorrect',  // 'AutoCorrect'|'AutoFormat As You Type'|'AutoFormat'|'Math AutoCorrect'

     // ── Tab AutoCorrect ──
     showAutoCorrectOptions:     true,
     correctTwoInitialCaps:      true,
     capitalizeFirstLetter:      true,
     capitalizeNamesOfDays:      true,
     correctAccidentalCapsLock:  true,
     replaceTextAsYouType:       true,
     replaceText:                'teh',   // ← MỚI: nội dung ô "Replace:"
     replaceWith:                'the',   // ← MỚI: nội dung ô "With:"

     // ── Tab AutoFormat As You Type ──
     straightQuotes:             true,
     fractions:                  true,
     boldItalicMarkdown:         true,
     internetPaths:              true,
     ordinals:                   true,
     hyphens:                    true,
     autoList:                   true,
     autoTab:                    false,

     // ── Tab AutoFormat ──
     afStraightQuotes:           true,
     afFractions:                true,
     afHyphens:                  true,
     afInternetPaths:            true,
     afBoldItalic:               true,
     afHeadings:                 true,
     afAutoList:                 true,

     // ── Tab Math AutoCorrect ──
     useOutsideMath:             false,
     mathReplaceText:            '\\alpha',  // ← MỚI: nội dung ô "Replace:"
     mathReplaceWith:            'α',        // ← MỚI: nội dung ô "With:"
   }
============================================================ */
function openAutoCorrectPopup(step){
    var box = _createPopupShell('AutoCorrect Options');
    var ans = step.popupAnswer || {};
    var a = {
        activeTab:                  ans.activeTab                  || 'AutoCorrect',
        showAutoCorrectOptions:     ans.showAutoCorrectOptions     !== false,
        correctTwoInitialCaps:      ans.correctTwoInitialCaps      !== false,
        capitalizeFirstLetter:      ans.capitalizeFirstLetter      !== false,
        capitalizeNamesOfDays:      ans.capitalizeNamesOfDays      !== false,
        correctAccidentalCapsLock:  ans.correctAccidentalCapsLock  !== false,
        replaceTextAsYouType:       ans.replaceTextAsYouType       !== false,
        replaceText:                ('replaceText' in ans) ? ans.replaceText : undefined,
        replaceWith:                ('replaceWith' in ans) ? ans.replaceWith : undefined,
        straightQuotes:             ans.straightQuotes             !== false,
        fractions:                  ans.fractions                  !== false,
        boldItalicMarkdown:         ans.boldItalicMarkdown         !== false,
        internetPaths:              ans.internetPaths              !== false,
        ordinals:                   ans.ordinals                   !== false,
        hyphens:                    ans.hyphens                    !== false,
        autoList:                   ans.autoList                   !== false,
        autoTab:                    ans.autoTab                    === true,
        afStraightQuotes:           ans.afStraightQuotes           !== false,
        afFractions:                ans.afFractions                !== false,
        afHyphens:                  ans.afHyphens                  !== false,
        afInternetPaths:            ans.afInternetPaths            !== false,
        afBoldItalic:               ans.afBoldItalic               !== false,
        afHeadings:                 ans.afHeadings                 !== false,
        afAutoList:                 ans.afAutoList                 !== false,
        useOutsideMath:             ans.useOutsideMath             === true,
        mathReplaceText:            ('mathReplaceText' in ans) ? ans.mathReplaceText : undefined,
        mathReplaceWith:            ('mathReplaceWith' in ans) ? ans.mathReplaceWith : undefined,
    };
    window._ppAns = a;
    /* Giá trị hiển thị mặc định khi MỞ popup — CỐ ĐỊNH, không đọc từ a (tránh lộ đáp án) */
    var _AC_DEFAULTS = {
        activeTab: 'AutoCorrect',
        showAutoCorrectOptions: true,
        correctTwoInitialCaps: true,
        capitalizeFirstLetter: true,
        capitalizeNamesOfDays: true,
        correctAccidentalCapsLock: true,
        replaceTextAsYouType: false,
        straightQuotes: true,
        fractions: true,
        boldItalicMarkdown: true,
        internetPaths: true,
        ordinals: true,
        hyphens: true,
        autoList: true,
        autoTab: false,
        afStraightQuotes: true,
        afFractions: true,
        afHyphens: true,
        afInternetPaths: true,
        afBoldItalic: true,
        afHeadings: true,
        afAutoList: true,
        useOutsideMath: false,
    };
    window._ppAcActiveTab = _AC_DEFAULTS.activeTab;
    /* Lưu danh sách replace tạm thời (mô phỏng) */
    window._ppAcReplaceList = [['(c)','©'],['(r)','®'],['teh','the']];
    window._ppMacReplaceList = [
        ['\\alpha','α'],['\\beta','β'],['\\gamma','γ'],['\\delta','δ'],
        ['\\pi','π'],['\\theta','θ'],['\\infty','∞'],['\\sqrt','√'],
        ['\\pm','±'],['\\leq','≤'],['\\geq','≥'],['\\neq','≠']
    ];

    var body = document.createElement('div');
    body.style.cssText = 'min-width:500px;max-width:580px;font-family:Arial,sans-serif;font-size:14px;';

    /* ── Tab bar ── */
    var tabs = ['AutoCorrect','AutoFormat As You Type','AutoFormat','Math AutoCorrect'];
    var tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;flex-wrap:wrap;border-bottom:2px solid #94a3b8;'
        +'padding:0 8px;background:#f1f5f9;';
    var tabEls = {};
    tabs.forEach(function(t){
        var td = document.createElement('div');
        td.textContent = t;
        td.style.cssText = 'padding:6px 10px;cursor:pointer;font-size:14px;'
            +'border:1px solid transparent;border-bottom:none;margin-bottom:-2px;'
            +'border-radius:3px 3px 0 0;color:#374151;white-space:nowrap;';
        td.addEventListener('click', function(){ _acSetTab(t); });
        tabBar.appendChild(td);
        tabEls[t] = td;
    });
    body.appendChild(tabBar);

    var content = document.createElement('div');
    content.style.cssText = 'padding:14px 16px;max-height:65vh;overflow-y:auto;';
    body.appendChild(content);

    /* ── Helpers ── */
    function mkChk(id, checked, label, indent){
        var wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;align-items:flex-start;gap:6px;margin-bottom:5px;'
            +(indent?'margin-left:'+indent+'px;':'');
        var c = document.createElement('input');
        c.type='checkbox'; c.id=id; c.checked=checked;
        c.style.cssText='flex-shrink:0;margin-top:2px;';
        var l = document.createElement('label');
        l.htmlFor=id; l.textContent=label;
        l.style.cssText='cursor:pointer;font-size:14px;line-height:1.4;';
        wrap.appendChild(c); wrap.appendChild(l);
        return wrap;
    }
    function mkSection(title){
        var d = document.createElement('div');
        d.style.cssText='font-weight:600;font-size:14px;color:#1e3a5f;'
            +'margin:10px 0 6px;border-bottom:1px solid #e2e8f0;padding-bottom:3px;';
        d.textContent = title;
        return d;
    }
    function mkHr(){
        var hr = document.createElement('hr');
        hr.style.cssText='margin:8px 0;border:0;border-top:1px solid #e2e8f0;';
        return hr;
    }

    /* ── Render bảng Replace/With dùng chung (AutoCorrect & Math) ── */
    function _acRenderReplaceTable(tblId, list){
        var tbl = document.createElement('div');
        tbl.id = tblId;
        tbl.style.cssText='margin-left:20px;margin-top:4px;border:1px solid #d1d5db;'
            +'border-radius:3px;overflow:hidden;max-height:100px;overflow-y:auto;';
        _acRefreshReplaceTable(tbl, list);
        return tbl;
    }
    function _acRefreshReplaceTable(tblEl, list){
        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;'
            +'background:#f1f5f9;padding:4px 8px;font-size:14px;font-weight:600;color:#374151;">'
            +'<span>Replace</span><span>With</span></div>';
        list.forEach(function(row){
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;'
                +'padding:4px 8px;font-size:14px;color:#64748b;border-top:1px solid #f1f5f9;">'
                +'<span>'+row[0]+'</span><span>'+row[1]+'</span></div>';
        });
        tblEl.innerHTML = html;
    }

    /* ── Tab: AutoCorrect ── */
    function renderAutoCorrect(){
        content.innerHTML = '';
        content.appendChild(mkChk('pp_ac_saco', _AC_DEFAULTS.showAutoCorrectOptions,
            'Show AutoCorrect Options buttons'));
        content.appendChild(mkHr());
        content.appendChild(mkSection('Replace:'));
        content.appendChild(mkChk('pp_ac_2caps', _AC_DEFAULTS.correctTwoInitialCaps,
            'Correct TWo INitial CApitals'));
        content.appendChild(mkChk('pp_ac_caps1', _AC_DEFAULTS.capitalizeFirstLetter,
            'Capitalize first letter of sentences'));
        content.appendChild(mkChk('pp_ac_days',  _AC_DEFAULTS.capitalizeNamesOfDays,
            'Capitalize names of days'));
        content.appendChild(mkChk('pp_ac_caplk', _AC_DEFAULTS.correctAccidentalCapsLock,
            'Correct accidental use of cAPS LOCK key'));
        content.appendChild(mkHr());
        content.appendChild(mkChk('pp_ac_rpl', _AC_DEFAULTS.replaceTextAsYouType,
            'Replace text as you type'));

        /* ── MỚI: ô nhập Replace / With ── */
        var inputRow = document.createElement('div');
        inputRow.style.cssText = 'display:grid;grid-template-columns:70px 1fr 70px 1fr;'
            +'gap:6px;align-items:center;margin-left:20px;margin-top:6px;';
        inputRow.innerHTML = `
            <label style="font-size:14px;">Replace:</label>
            <input type="text" id="pp_ac_replaceText" placeholder="Nhập từ cần thay thế..."
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;">
            <label style="font-size:14px;">With:</label>
            <input type="text" id="pp_ac_replaceWith" placeholder="Nhập từ thay thế..."
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;">`;
        content.appendChild(inputRow);

        /* Bảng danh sách replace */
        var tbl = _acRenderReplaceTable('pp_ac_replaceTable', window._ppAcReplaceList);
        content.appendChild(tbl);

        /* ── MỚI: nút Replace / Delete ── */
        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;margin-left:20px;margin-top:6px;';
        btnRow.innerHTML = `
            <button type="button" class="pp-btn pp-btn-ok" id="pp_ac_btnReplace"
                style="font-size:14px;padding:4px 14px;">Replace</button>
            <button type="button" class="pp-btn" id="pp_ac_btnDelete"
                style="font-size:14px;padding:4px 14px;color:#dc2626;">Delete</button>`;
        content.appendChild(btnRow);

        document.getElementById('pp_ac_btnReplace').addEventListener('click', function(){
            var t = (document.getElementById('pp_ac_replaceText')||{}).value||'';
            var w = (document.getElementById('pp_ac_replaceWith')||{}).value||'';
            if(!t.trim()||!w.trim()){
                _showPopupError('pp_err_autocorrect','⚠️ Nhập đủ Replace và With trước khi bấm Replace.');
                return;
            }
            _hidePopupError('pp_err_autocorrect');
            window._ppAcLastAction = 'Replace';
            /* Cập nhật/thêm vào danh sách */
            var found = window._ppAcReplaceList.find(function(r){return r[0]===t.trim();});
            if(found){ found[1] = w.trim(); }
            else{ window._ppAcReplaceList.push([t.trim(), w.trim()]); }
            _acRefreshReplaceTable(document.getElementById('pp_ac_replaceTable'), window._ppAcReplaceList);
        });
        document.getElementById('pp_ac_btnDelete').addEventListener('click', function(){
            var t = (document.getElementById('pp_ac_replaceText')||{}).value||'';
            _hidePopupError('pp_err_autocorrect');
            window._ppAcLastAction = 'Delete';
            window._ppAcReplaceList = window._ppAcReplaceList.filter(function(r){return r[0]!==t.trim();});
            _acRefreshReplaceTable(document.getElementById('pp_ac_replaceTable'), window._ppAcReplaceList);
        });
    }

    /* ── Tab: AutoFormat As You Type ── */
    function renderAutoFormatType(){
        content.innerHTML = '';
        content.appendChild(mkSection('Replace as you type'));
        content.appendChild(mkChk('pp_aft_sq',    _AC_DEFAULTS.straightQuotes,    '"Straight quotes" with "smart quotes"'));
        content.appendChild(mkChk('pp_aft_frac',  _AC_DEFAULTS.fractions,         'Fractions (1/2) with fraction character (½)'));
        content.appendChild(mkChk('pp_aft_hyph',  _AC_DEFAULTS.hyphens,           'Hyphens (--) with dash (—)'));
        content.appendChild(mkChk('pp_aft_bold',  _AC_DEFAULTS.boldItalicMarkdown,'*Bold* and _italic_ with real formatting'));
        content.appendChild(mkChk('pp_aft_inet',  _AC_DEFAULTS.internetPaths,     'Internet and network paths with hyperlinks'));
        content.appendChild(mkChk('pp_aft_ord',   _AC_DEFAULTS.ordinals,          'Ordinals (1st) with superscript'));
        content.appendChild(mkHr());
        content.appendChild(mkSection('Apply as you type'));
        content.appendChild(mkChk('pp_aft_list',  _AC_DEFAULTS.autoList,          'Automatic bulleted lists'));
        content.appendChild(mkChk('pp_aft_tab',   _AC_DEFAULTS.autoTab,           'Set left- and first-indent with tabs and backspaces'));
    }

    /* ── Tab: AutoFormat ── */
    function renderAutoFormat(){
        content.innerHTML = '';
        content.appendChild(mkSection('Replace'));
        content.appendChild(mkChk('pp_af_sq',    _AC_DEFAULTS.afStraightQuotes, '"Straight quotes" with "smart quotes"'));
        content.appendChild(mkChk('pp_af_frac',  _AC_DEFAULTS.afFractions,      'Fractions (1/2) with fraction character (½)'));
        content.appendChild(mkChk('pp_af_hyph',  _AC_DEFAULTS.afHyphens,        'Hyphens (--) with dash (—)'));
        content.appendChild(mkChk('pp_af_inet',  _AC_DEFAULTS.afInternetPaths,  'Internet and network paths with hyperlinks'));
        content.appendChild(mkChk('pp_af_bold',  _AC_DEFAULTS.afBoldItalic,     '*Bold* and _italic_ with real formatting'));
        content.appendChild(mkHr());
        content.appendChild(mkSection('Apply'));
        content.appendChild(mkChk('pp_af_head',  _AC_DEFAULTS.afHeadings,       'Built-in Heading styles'));
        content.appendChild(mkChk('pp_af_list',  _AC_DEFAULTS.afAutoList,       'Automatic bulleted lists'));
    }

    /* ── Tab: Math AutoCorrect ── */
    function renderMathAutoCorrect(){
        content.innerHTML = '';
        content.appendChild(mkChk('pp_mac_out', _AC_DEFAULTS.useOutsideMath,
            'Use Math AutoCorrect rules outside of math regions'));
        content.appendChild(mkHr());

        /* ── MỚI: ô nhập Replace / With ── */
        var inputRow = document.createElement('div');
        inputRow.style.cssText = 'display:grid;grid-template-columns:70px 1fr 70px 1fr;'
            +'gap:6px;align-items:center;margin-top:4px;';
        inputRow.innerHTML = `
            <label style="font-size:14px;">Replace:</label>
            <input type="text" id="pp_mac_replaceText" placeholder="Nhập mã (vd: \\alpha)..."
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;font-family:monospace;">
            <label style="font-size:14px;">With:</label>
            <input type="text" id="pp_mac_replaceWith" placeholder="Nhập ký hiệu (vd: α)..."
                style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;">`;
        content.appendChild(inputRow);

        /* Bảng danh sách symbol Math */
        var tbl = _acRenderReplaceTable('pp_mac_replaceTable', window._ppMacReplaceList);
        content.appendChild(tbl);

        /* ── MỚI: nút Add / Delete ── */
        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;margin-top:6px;';
        btnRow.innerHTML = `
            <button type="button" class="pp-btn pp-btn-ok" id="pp_mac_btnAdd"
                style="font-size:14px;padding:4px 14px;">Add</button>
            <button type="button" class="pp-btn" id="pp_mac_btnDelete"
                style="font-size:14px;padding:4px 14px;color:#dc2626;">Delete</button>`;
        content.appendChild(btnRow);

        document.getElementById('pp_mac_btnAdd').addEventListener('click', function(){
            var t = (document.getElementById('pp_mac_replaceText')||{}).value||'';
            var w = (document.getElementById('pp_mac_replaceWith')||{}).value||'';
            if(!t.trim()||!w.trim()){
                _showPopupError('pp_err_autocorrect','⚠️ Nhập đủ Replace và With trước khi bấm Add.');
                return;
            }
            _hidePopupError('pp_err_autocorrect');
            window._ppMacLastAction = 'Add';
            var found = window._ppMacReplaceList.find(function(r){return r[0]===t.trim();});
            if(found){ found[1] = w.trim(); }
            else{ window._ppMacReplaceList.push([t.trim(), w.trim()]); }
            _acRefreshReplaceTable(document.getElementById('pp_mac_replaceTable'), window._ppMacReplaceList);
        });
        document.getElementById('pp_mac_btnDelete').addEventListener('click', function(){
            var t = (document.getElementById('pp_mac_replaceText')||{}).value||'';
            _hidePopupError('pp_err_autocorrect');
            window._ppMacLastAction = 'Delete';
            window._ppMacReplaceList = window._ppMacReplaceList.filter(function(r){return r[0]!==t.trim();});
            _acRefreshReplaceTable(document.getElementById('pp_mac_replaceTable'), window._ppMacReplaceList);
        });

        var note = document.createElement('div');
        note.style.cssText='font-size:12px;color:#94a3b8;margin-top:6px;';
        note.textContent='Danh sách ký hiệu Math AutoCorrect (tham khảo).';
        content.appendChild(note);
    }

    /* ── Chuyển tab ── */
    function _acSetTab(tab){
        window._ppAcActiveTab = tab;
        tabs.forEach(function(t){
            var el = tabEls[t];
            if(t === tab){
                el.style.background   = '#fff';
                el.style.border       = '1px solid #94a3b8';
                el.style.borderBottom = '2px solid #fff';
                el.style.fontWeight   = '600';
                el.style.color        = '#1e3a5f';
            } else {
                el.style.background   = '';
                el.style.border       = '1px solid transparent';
                el.style.fontWeight   = '';
                el.style.color        = '#374151';
            }
        });
        if     (tab==='AutoCorrect')            renderAutoCorrect();
        else if(tab==='AutoFormat As You Type') renderAutoFormatType();
        else if(tab==='AutoFormat')             renderAutoFormat();
        else if(tab==='Math AutoCorrect')       renderMathAutoCorrect();
    }
    window._acSetTab = _acSetTab;

    /* ── Error + Buttons ── */
    var errDiv = document.createElement('div');
    errDiv.id='pp_err_autocorrect'; errDiv.className='pp-error';
    errDiv.style.margin='0 16px 4px';
    body.appendChild(errDiv);

    var btnRow = document.createElement('div');
    btnRow.style.cssText='display:flex;justify-content:flex-end;gap:8px;'
        +'padding:10px 16px;border-top:1px solid #e2e8f0;';
    var btnOK = document.createElement('button');
    btnOK.textContent='OK'; btnOK.className='pp-btn pp-btn-ok';
    btnOK.onclick = function(){ checkAutoCorrectPopup(); };
    var btnCancel = document.createElement('button');
    btnCancel.textContent='Cancel'; btnCancel.className='pp-btn pp-btn-cancel';
    btnCancel.onclick = function(){ closeMosPopup(); };
    btnRow.appendChild(btnOK); btnRow.appendChild(btnCancel);
    body.appendChild(btnRow);
    box.appendChild(body);
box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
box.closest('.mos-popup-overlay').style.paddingTop = '14px';
body.querySelectorAll('label,input,select,button').forEach(el=>{
    el.style.fontSize = '14px';});
    setTimeout(function(){ _acSetTab(_AC_DEFAULTS.activeTab); }, 0);
}

/* ── Kiểm tra đáp án AutoCorrect ── */
function checkAutoCorrectPopup(){
    _hidePopupError('pp_err_autocorrect');
    var a = window._ppAns;
    var errors = [];

    if(window._ppAcActiveTab !== a.activeTab)
        errors.push('Tab: cần chọn "'+a.activeTab+'"');

    function chkBox(id, expected, label){
        if(expected === undefined) return;
        var el = document.getElementById(id);
        if(el && el.checked !== expected)
            errors.push(label+': cần '+(expected?'bật':'tắt'));
    }

    if(a.activeTab === 'AutoCorrect'){
        chkBox('pp_ac_saco',  a.showAutoCorrectOptions,    'Show AutoCorrect Options');
        chkBox('pp_ac_2caps', a.correctTwoInitialCaps,     'Correct TWo INitial CApitals');
        chkBox('pp_ac_caps1', a.capitalizeFirstLetter,     'Capitalize first letter');
        chkBox('pp_ac_days',  a.capitalizeNamesOfDays,     'Capitalize names of days');
        chkBox('pp_ac_caplk', a.correctAccidentalCapsLock, 'Correct accidental CapsLock');
        chkBox('pp_ac_rpl',   a.replaceTextAsYouType,      'Replace text as you type');

        /* ── MỚI: chỉ yêu cầu Replace/With khi có giá trị THẬT (khác rỗng) — tránh trường hợp
           khai báo replaceText:'' / replaceWith:'' (chỉ để giữ chỗ) lại vô tình bắt buộc thao tác thừa ── */
        const needReplaceText  = (a.replaceText  !== undefined && a.replaceText  !== '');
        const needReplaceWith  = (a.replaceWith  !== undefined && a.replaceWith  !== '');
        if(needReplaceText || needReplaceWith){
            var rt = (document.getElementById('pp_ac_replaceText')||{}).value||'';
            var rw = (document.getElementById('pp_ac_replaceWith')||{}).value||'';
            if(needReplaceText && rt.trim() !== a.replaceText)
                errors.push('Replace→"'+a.replaceText+'"');
            if(needReplaceWith && rw.trim() !== a.replaceWith)
                errors.push('With→"'+a.replaceWith+'"');
            if(window._ppAcLastAction !== 'Replace')
                errors.push('Cần bấm nút "Replace" để xác nhận thêm.');
        }

    } else if(a.activeTab === 'AutoFormat As You Type'){
        chkBox('pp_aft_sq',   a.straightQuotes,    'Straight quotes');
        chkBox('pp_aft_frac', a.fractions,         'Fractions');
        chkBox('pp_aft_hyph', a.hyphens,           'Hyphens');
        chkBox('pp_aft_bold', a.boldItalicMarkdown,'Bold/Italic markdown');
        chkBox('pp_aft_inet', a.internetPaths,     'Internet paths');
        chkBox('pp_aft_ord',  a.ordinals,          'Ordinals');
        chkBox('pp_aft_list', a.autoList,          'Auto bulleted lists');
        chkBox('pp_aft_tab',  a.autoTab,           'Set indent with tabs');
    } else if(a.activeTab === 'AutoFormat'){
        chkBox('pp_af_sq',   a.afStraightQuotes, 'Straight quotes');
        chkBox('pp_af_frac', a.afFractions,      'Fractions');
        chkBox('pp_af_hyph', a.afHyphens,        'Hyphens');
        chkBox('pp_af_inet', a.afInternetPaths,  'Internet paths');
        chkBox('pp_af_bold', a.afBoldItalic,     'Bold/Italic');
        chkBox('pp_af_head', a.afHeadings,       'Headings');
        chkBox('pp_af_list', a.afAutoList,       'Auto bulleted lists');
    } else if(a.activeTab === 'Math AutoCorrect'){
        chkBox('pp_mac_out', a.useOutsideMath, 'Use outside math regions');

        /* ── MỚI: kiểm tra Replace/With đã nhập/xử lý đúng chưa ── */
        if(a.mathReplaceText !== undefined || a.mathReplaceWith !== undefined){
            var mrt = (document.getElementById('pp_mac_replaceText')||{}).value||'';
            var mrw = (document.getElementById('pp_mac_replaceWith')||{}).value||'';
            if(a.mathReplaceText !== undefined && mrt.trim() !== a.mathReplaceText)
                errors.push('Replace→"'+a.mathReplaceText+'"');
            if(a.mathReplaceWith !== undefined && mrw.trim() !== a.mathReplaceWith)
                errors.push('With→"'+a.mathReplaceWith+'"');
            if(window._ppMacLastAction !== 'Add')
                errors.push('Cần bấm nút "Add" để xác nhận thêm.');
        }
    }

    if(errors.length){
        _showPopupError('pp_err_autocorrect','❌ Chưa đúng:<br>• '+errors.join('<br>• '));
        return;
    }
    closeMosPopup();
    checkCorrect();
}

/* ============================================================
   34. POPUP COVER PAGE — 5 khung thông tin, chọn khung + nút Delete //copy vào HTML
popupType: 'coverpage',
popupAnswer: {
    	title:    'Annual Report',
    	subtitle: 'Fiscal Year 2026',
    	author:   '', 
    	date:     null,
    	company:  'ABC Corporation' }},
//null là chọn -> xóa , '' văn bản của Coverpage hiển thị bình thường
   ============================================================
popupType: 'coverpage',
popupAnswer: {
    title:    '',
    subtitle: null,
    author:   '', 
    date:     '',
    company:  '' }},
    // Nếu câu hỏi không yêu cầu thông tin thì để trống '' (không khoảng cách)
    // Nếu câu hỏi yêu cầu XÓA một khung thông tin,
    // khai báo field đó = null → học sinh phải CLICK CHỌN khung đó
    // rồi bấm nút "Delete" (không phải phím Delete trên bàn phím)
    // Ví dụ: title: null  → yêu cầu chọn khung Title rồi bấm nút Delete

   ============================================================
   Chỉ khai báo field cần kiểm tra trong popupAnswer — field không khai báo
   sẽ được bỏ qua khi chấm điểm (không bắt buộc nhập đúng/xóa).
============================================================ */
function openCoverPagePopup(step){
    const box = _createPopupShell('Cover Page — Building Blocks');
    const ans = step.popupAnswer || {};

    /* Danh sách 5 khung thông tin mặc định (giống Word Cover Page thật) */
    const fieldsDef = [
        { key:'title',    label:'[Document Title]',   placeholder:'Nhập tiêu đề tài liệu...' },
        { key:'subtitle', label:'[Document Subtitle]', placeholder:'Nhập phụ đề...' },
        { key:'author',   label:'[Author Name]',       placeholder:'Nhập tên tác giả...' },
        { key:'address',  label:'[Company Address]',   placeholder:'Nhập ngày (vd: 01/01/2026)...' },
        { key:'company',  label:'[Company Name]',      placeholder:'Nhập tên công ty...' },
    ];

    window._ppAns = {};
    fieldsDef.forEach(function(f){
        if(f.key in ans){ window._ppAns[f.key] = ans[f.key]; } /* null = yêu cầu xóa */
    });

    /* Trạng thái field: value hiện tại + đã bị xóa hay chưa */
    window._ppCoverState = {};
    fieldsDef.forEach(function(f){
        window._ppCoverState[f.key] = { removed:false, value:'' };
    });
    /* Khung đang được CHỌN (selected) — chỉ 1 khung tại 1 thời điểm */
    window._ppCoverSelected = null;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:400px;gap:10px;padding:14px 16px;';

    const intro = document.createElement('div');
    intro.style.cssText = 'font-size:14px;color:#64748b;background:#eff6ff;'
        +'border:1px solid #bfdbfe;border-radius:4px;padding:6px 10px;';
    intro.innerHTML = '📄 Click chọn khung cần xử lý (viền sẽ chuyển xanh), '
        +'nhập nội dung trực tiếp, bấm nút <b>🗑 Delete</b> hoặc nhấn phím <b>Delete</b> trên bàn phím để xóa khung đang chọn.';
    body.appendChild(intro);

    const listWrap = document.createElement('div');
    listWrap.id = 'pp_cover_list';
    listWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

    fieldsDef.forEach(function(f){
        const row = document.createElement('div');
        row.id = 'pp_cover_row_'+f.key;
        row.dataset.key = f.key;
        row.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;'
            +'border:2px dashed #94a3b8;border-radius:5px;padding:6px 8px;background:#f8fafc;'
            +'transition:all 0.15s;';

        const lbl = document.createElement('label');
        lbl.style.cssText = 'font-size:12px;color:#374151;min-width:110px;flex-shrink:0;pointer-events:none;';
        lbl.textContent = f.label;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'pp_cover_input_'+f.key;
        input.placeholder = f.placeholder;
        input.style.cssText = 'flex:1;padding:5px 8px;border:1px solid #cbd5e1;'
            +'border-radius:3px;font-size:13px;box-sizing:border-box;background:#fff;';
        input.addEventListener('input', function(){
            window._ppCoverState[f.key].value = input.value;
        });
        /* Click vào input cũng chọn khung, không chặn việc gõ chữ */
        input.addEventListener('click', function(e){
            e.stopPropagation();
            pp_coverSelect(f.key);
        });

        /* Click cả dòng (kể cả label) → chọn khung, giống click vào content control */
        row.addEventListener('click', function(){
            pp_coverSelect(f.key);
        });

        row.appendChild(lbl);
        row.appendChild(input);
        listWrap.appendChild(row);
    });
    body.appendChild(listWrap);

    /* ── Thanh trạng thái khung đang chọn ── */
    const statusBar = document.createElement('div');
    statusBar.id = 'pp_cover_status';
    statusBar.style.cssText = 'font-size:12px;color:#94a3b8;padding:4px 2px;';
    statusBar.textContent = 'Chưa chọn khung nào.';
    body.appendChild(statusBar);

    /* ── Nút Delete dùng chung (giống nút Delete trên thanh công cụ Word) ── */
    const toolRow = document.createElement('div');
    toolRow.style.cssText = 'display:flex;gap:8px;';
    toolRow.innerHTML = `
        <button type="button" id="pp_cover_btnDelete"
            style="padding:6px 16px;border:1px solid #dc2626;border-radius:4px;
                   background:#fee2e2;color:#dc2626;font-size:13px;font-weight:bold;
                   cursor:not-allowed;opacity:0.5;" disabled>
            🗑 Delete
        </button>`;
    body.appendChild(toolRow);
    toolRow.querySelector('#pp_cover_btnDelete')
        .addEventListener('click', function(){ pp_coverDeleteSelected(); });

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_coverpage';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.className = 'pp-btn-row';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkCoverPagePopup()">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '14px';
    body.querySelectorAll('label,input,select,button').forEach(el=>{
        el.style.fontSize = '14px';});
    setTimeout(function(){ _tocSetTab(a.activeTab); }, 0);

    /* ── BẮT SỰ KIỆN NÚT DELETE BÀN PHÍM ── */
    if (window._ppCoverKeyHandler) {
        document.removeEventListener('keydown', window._ppCoverKeyHandler);
    }
    window._ppCoverKeyHandler = function(e) {
        if (e.key === 'Delete' || e.key === 'Del') {
            const activeEl = document.activeElement;
            /* Nếu đang focus trong ô input thì để nguyên thao tác xóa chữ bình thường */
            if (activeEl && activeEl.tagName === 'INPUT') {
                return;
            }
            /* Nếu đang chọn khung (selected row) thì thực hiện xóa khung */
            if (window._ppCoverSelected) {
                e.preventDefault();
                pp_coverDeleteSelected();
            }
        }
    };
    document.addEventListener('keydown', window._ppCoverKeyHandler);
}

/* ── Click chọn 1 khung (giống chọn Content Control trong Word) ── */
function pp_coverSelect(key){
    const state = window._ppCoverState[key];
    if(state.removed){ return; } /* Khung đã xóa thì không chọn được nữa */

    window._ppCoverSelected = key;

    /* Cập nhật highlight cho tất cả các row */
    Object.keys(window._ppCoverState).forEach(function(k){
        const row = document.getElementById('pp_cover_row_'+k);
        if(!row){ return; }
        if(k === key){
            row.style.border = '2px solid #2563eb';
            row.style.background = '#eff6ff';
        } else if(!window._ppCoverState[k].removed){
            row.style.border = '2px dashed #94a3b8';
            row.style.background = '#f8fafc';
        }
    });

    /* Cập nhật thanh trạng thái + bật nút Delete */
    const statusBar = document.getElementById('pp_cover_status');
    if(statusBar){
        statusBar.textContent = 'Đang chọn khung: ' + key;
        statusBar.style.color = '#2563eb';
    }
    const btnDel = document.getElementById('pp_cover_btnDelete');
    if(btnDel){
        btnDel.disabled = false;
        btnDel.style.cursor = 'pointer';
        btnDel.style.opacity = '1';
    }
}

/* ── Bấm nút Delete dùng chung — xóa khung đang được chọn ── */
function pp_coverDeleteSelected(){
    const key = window._ppCoverSelected;
    if(!key){ return; }

    const row   = document.getElementById('pp_cover_row_'+key);
    const input = document.getElementById('pp_cover_input_'+key);
    if(!row || !input){ return; }

    const state = window._ppCoverState[key];
    state.removed = true;
    state.value   = '';
    input.value    = '';
    input.disabled = true;

    row.style.border         = '2px dashed #cbd5e1';
    row.style.background     = '#f1f5f9';
    row.style.opacity        = '0.45';
    row.style.textDecoration = 'line-through';
    row.style.cursor         = 'not-allowed';

    /* Bỏ chọn sau khi xóa, tắt nút Delete */
    window._ppCoverSelected = null;
    const statusBar = document.getElementById('pp_cover_status');
    if(statusBar){
        statusBar.textContent = 'Đã xóa khung "'+key+'". Chưa chọn khung nào.';
        statusBar.style.color = '#16a34a';
    }
    const btnDel = document.getElementById('pp_cover_btnDelete');
    if(btnDel){
        btnDel.disabled = true;
        btnDel.style.cursor = 'not-allowed';
        btnDel.style.opacity = '0.5';
    }
}

/* ── Hàm check ── */
function checkCoverPagePopup(){
    _hidePopupError('pp_err_coverpage');
    const a = window._ppAns || {};
    let errors = [];

    Object.keys(a).forEach(function(key){
        const expected = a[key];
        const state = window._ppCoverState[key] || { removed:false, value:'' };

        if(expected === null){
            /* Yêu cầu: đã CHỌN khung này và bấm nút Delete hoặc phím Delete để xóa */
            if(!state.removed){
                errors.push(key + '→ cần chọn khung này rồi xóa');
            }
        } else if(expected !== undefined){
            /* Yêu cầu NỘI DUNG cụ thể */
            if(state.removed || state.value.trim() !== expected){
                errors.push(key + '→"' + expected + '"');
            }
        }
    });

    if(errors.length){
        _showPopupError('pp_err_coverpage', '❌ Chưa đúng! ' + errors.join(' | '));
        return;
    }

    /* Dọn dẹp listener phím bấm khi đóng popup thành công */
    if (window._ppCoverKeyHandler) {
        document.removeEventListener('keydown', window._ppCoverKeyHandler);
        window._ppCoverKeyHandler = null;
    }

    closeMosPopup(); checkCorrect();
}
/* ============================================================
   35. POPUP WORD OPTIONS — ADVANCED //copy vào HTML
// Thêm ô check
scroll.appendChild(mkSection('Save'));
scroll.appendChild(mkCheckGroup('pp_oa_save', ['A','B']));
thành scroll.appendChild(mkCheckGroup('pp_oa_save', ['Always create backup copy','Allow background saves']));
//khai báo Const và khai báo trong HTML
const chkMap = {
saveA:'pp_oa_saveA',   saveB:'pp_oa_saveB',
   ============================================================
popupType: 'option-advanced',
popupAnswer: {
	editA: true,  editB: false, editC: false, editD: false, editE: true,  editF: false, editG: false, editH: false,
     	pasteA: true, pasteB: false, pasteC: false, pasteD: true, 
     	showA: false,  showB: false, showC: false, showD: false, pasteE: false, pasteF: true,
     useDraftFont:   false,
     draftFontName:  'Courier New',
     draftFontSize:  '10',
	dispA: false, dispB: false, dispC: false, dispD: false, dispE: false, dispF: false,
     dispNum1:     '25',          
     dispNum2:     '4',         
     dispNum3:     '5',          
     dispUnit:     'Centimeters',
     stylesWidth:  '0"',       
	printA: false, printB: false, printC: false, printD: false, printE: false,
	wprintA: false, wprintB: false,
	saveA: false, saveB: false,
	fidelA: false, fidelB: false,
	genA: false, genB: false,
   }},
   Chỉ khai báo field cần kiểm tra — field không khai báo sẽ bị bỏ qua khi chấm điểm.

============================================================ */
const _OA_DEFAULTS = {
    draftFontName: 'Courier New',
    draftFontSize: '10',
    dispNum1:      '50',           // Show this number of Recent Documents
    dispNum2:      '4',            // Quickly access this number of Recent Documents
    dispNum3:      '3',            // Show this number of unpinned Recent Folders
    dispUnit:      'Inches',       // Show measurements in units of
    stylesWidth:   '0"',           // Style area pane width in Draft and Outline views
};

function openOptionAdvancedPopup(step){
    const box = _createPopupShell('Word Options — Advanced');
    const ans = step.popupAnswer || {};

    window._ppAns = {};
    [
        'editA','editB','editC','editD','editE','editF','editG','editH',
        'pasteA','pasteB','pasteC','pasteD',
        'showA','showB','showC','showD','dispE','dispF','useDraftFont','draftFontName','draftFontSize',
        'dispA','dispB','dispC','dispD','dispE','dispNum1','dispNum2','dispNum3','dispUnit','stylesWidth',
        'printA','printB','printC','printD','printE',
        'wprintA','wprintB',
        'saveA','saveB','saveC','saveD',
        'fidelA','fidelB',
        'genA','genB','genC','genD',
    ].forEach(function(k){
        if(k in ans){ window._ppAns[k] = ans[k]; }
    });

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:460px;max-width:560px;gap:0;padding:0;font-size:14px;';

    const scroll = document.createElement('div');
    scroll.style.cssText = 'max-height:65vh;overflow-y:auto;padding:14px 16px;'
        +'display:flex;flex-direction:column;gap:4px;';
    body.appendChild(scroll);

    function mkSection(title){
        const d = document.createElement('div');
        d.style.cssText = 'font-size:14px;font-weight:bold;color:#1e3a5f;'
            +'margin:10px 0 6px;padding:6px 8px;background:#eff6ff;'
            +'border-left:4px solid #2563eb;border-radius:3px;';
        d.textContent = title;
        return d;
    }

function mkCheckGroup(idPrefix, items){
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:5px;margin-bottom:4px;';
    items.forEach(function(item){
        const isObj = (typeof item === 'object');
        const id    = isObj ? item.id    : item;
        const text  = isObj ? item.label : item;

        const row = document.createElement('label');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;'
            +'font-size:14px;cursor:pointer;color:#374151;';
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.id = idPrefix + id;   // ← id luôn giữ A/B/C/D
        row.appendChild(chk);
        row.appendChild(document.createTextNode(text));
        wrap.appendChild(row);
    });
    return wrap;
}

    /* ── MỚI: mkInputRow nhận thêm defaultVal — luôn set value mặc định ── */
    function mkInputRow(id, label, type, width, defaultVal){
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;'
            +'font-size:14px;margin-bottom:5px;flex-wrap:wrap;';
        const lbl = document.createElement('label');
        lbl.style.cssText = 'font-size:14px;color:#374151;flex:1;min-width:200px;';
        lbl.textContent = label;
        const inp = document.createElement('input');
        inp.type = type || 'text';
        inp.id = id;
        if(defaultVal !== undefined && defaultVal !== null){
            inp.value = defaultVal;
        }
        inp.style.cssText = 'font-size:14px;padding:4px 6px;border:1px solid #94a3b8;'
            +'border-radius:3px;width:'+(width||'80px')+';box-sizing:border-box;';
        row.appendChild(lbl);
        row.appendChild(inp);
        return row;
    }

/* ══ 1. Editing options ══ */
scroll.appendChild(mkSection('Editing options'));
scroll.appendChild(mkCheckGroup('pp_oa_edit', [
    {id:'A', label:'Typing replaces selected text'},
    {id:'B', label:'Allow text to be dragged and dropped'},
    {id:'C', label:'Use CTRL + Click to follow hyperlink'},
    {id:'D', label:'Use smart paragraph selection'},
    {id:'E', label:'Use smart cursoring'},
    {id:'F', label:'Enable click and type'},
    {id:'G', label:'Show AutoComplete suggestions'},
    {id:'H', label:'Use sequence checking'},
		]));

/* ══ 2. Cut, copy, and paste ══ */
scroll.appendChild(mkSection('Cut, copy, and paste'));
scroll.appendChild(mkCheckGroup('pp_oa_paste', [
    {id:'A', label:'Keep bullets and numbers when pasting text with Keep Text Only option'},
    {id:'B', label:'Use the Insert key for paste'},
    {id:'C', label:'Show Paste Options button when content is pasted'},
    {id:'D', label:'Use smart cut and paste'},
		]));

/* ══ 3. Show document content ══ */
scroll.appendChild(mkSection('Show document content'));
scroll.appendChild(mkCheckGroup('pp_oa_show', [
    {id:'A', label:'Discard editing data'},
    {id:'B', label:'Do not compress images in file'},
    {id:'C', label:'Show background colors and images in Print Layout view'},
    {id:'D', label:'Show text wrapped within the document window'},
    {id:'E', label:'Show picture placeholders'},
    {id:'F', label:'Show drawings and text boxes on screen'},
		]));
    const draftWrap = document.createElement('div');
    draftWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-bottom:4px;';

    const draftChkRow = document.createElement('label');
    draftChkRow.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;color:#374151;';
    const draftChk = document.createElement('input');
    draftChk.type = 'checkbox';
    draftChk.id = 'pp_oa_useDraftFont';
    draftChk.addEventListener('change', pp_oaToggleDraftFont);
    draftChkRow.appendChild(draftChk);
    draftChkRow.appendChild(document.createTextNode('Use draft font in Draft and Outline views'));
    draftWrap.appendChild(draftChkRow);

    /* ── MỚI: 2 ô Name/Size dùng <select>, set giá trị mặc định từ _OA_DEFAULTS ── */
    const draftInputs = document.createElement('div');
    draftInputs.id = 'pp_oa_draftInputs';
    draftInputs.style.cssText = 'display:grid;grid-template-columns:auto 1fr auto 90px;'
        +'gap:6px 8px;align-items:center;margin-left:24px;opacity:0.4;pointer-events:none;font-size:14px;';
    draftInputs.innerHTML = `
        <label style="font-size:14px;">Name:</label>
        <select id="pp_oa_draftFontName" style="font-size:14px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
            <option value="Courier New">Courier New</option>
            <option value="Arial">Arial</option>
            <option value="Calibri">Calibri</option>
        </select>
        <label style="font-size:14px;">Size:</label>
        <select id="pp_oa_draftFontSize" style="font-size:14px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
            <option value="8">8</option>
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="14">14</option>
        </select>`;
    draftWrap.appendChild(draftInputs);
    scroll.appendChild(draftWrap);

/* ══ 4. Display ══ */
scroll.appendChild(mkSection('Display'));
scroll.appendChild(mkCheckGroup('pp_oa_disp', [
    {id:'A', label:'Show shortcut keys in ScreenTips'},
    {id:'B', label:'Show horizontal scroll bar'},
    {id:'C', label:'Show vertical scroll bar'},
    {id:'D', label:'Show vertical ruler in Print Layout view'},
    {id:'E', label:'Update document content while dragging'},
    {id:'F', label:'Use subpixel positioning to smooth fonts on screen'},
		]));
    const dispInputsWrap = document.createElement('div');
    dispInputsWrap.style.cssText = 'display:flex;flex-direction:column;gap:2px;margin-top:4px;';
    dispInputsWrap.appendChild(mkInputRow('pp_oa_dispNum1', 'Show this number of Recent Documents:', 'number', '70px', _OA_DEFAULTS.dispNum1));
    dispInputsWrap.appendChild(mkInputRow('pp_oa_dispNum2', 'Quickly access this number of Recent Documents:', 'number', '70px', _OA_DEFAULTS.dispNum2));
    dispInputsWrap.appendChild(mkInputRow('pp_oa_dispNum3', 'Show this number of unpinned Recent Folders:', 'number', '70px', _OA_DEFAULTS.dispNum3));
    dispInputsWrap.appendChild(mkInputRow('pp_oa_dispUnit', 'Show measurements in units of:', 'text', '140px', _OA_DEFAULTS.dispUnit));
    dispInputsWrap.appendChild(mkInputRow('pp_oa_stylesWidth', 'Style area pane width in Draft and Outline views:', 'text', '80px', _OA_DEFAULTS.stylesWidth));
    scroll.appendChild(dispInputsWrap);

/* ══ 5. Print ══ */
scroll.appendChild(mkSection('Print'));
scroll.appendChild(mkCheckGroup('pp_oa_print', [
    {id:'A', label:'Print in background'},
    {id:'B', label:'Allow field containing tracked change to update before printing'},
    {id:'C', label:'Scale content for A4 or 8.5 x 11 paper sizes'},
    {id:'D', label:'Print pages in reverse order'},
    {id:'E', label:'Print XML tags'},
		]));

/* ══ 6. When printing this document ══ */
scroll.appendChild(mkSection('When printing this document'));
scroll.appendChild(mkCheckGroup('pp_oa_wprint', [
    {id:'A', label:'Print PostScript over text'},
    {id:'B', label:'Print only the data from a form'},
		]));

/* ══ 7. Save ══ */
scroll.appendChild(mkSection('Save'));
scroll.appendChild(mkCheckGroup('pp_oa_save', [
    {id:'A', label:'Prompt before saving Normal template'},
    {id:'B', label:'Always create backup copy'},
    {id:'C', label:'Copy remotely stored files onto your computer, and update the remote file when saving'},
    {id:'D', label:'Allow background saves'},
		]));

/* ══ 8. Preserve fidelity when sharing this document ══ */
scroll.appendChild(mkSection('Preserve fidelity when sharing this document'));
scroll.appendChild(mkCheckGroup('pp_oa_fidel', [
    {id:'A', label:'Save form data as delimited text file'},
    {id:'B', label:'Embed linguistic data'},
		]));

/* ══ 9. General ══ */
scroll.appendChild(mkSection('General'));
scroll.appendChild(mkCheckGroup('pp_oa_gen', [
    {id:'A', label:'Provide feedback with sound'},
    {id:'B', label:'Provide feedback with animation'},
    {id:'C', label:'Confirm file format conversion on open'},
    {id:'D', label:'Update automatic links at open'},
		]));
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_optionadv';
    errDiv.style.margin = '0 16px 6px';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;'
        +'padding:10px 16px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkOptionAdvancedPopup()">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.style.width = '98%';

    setTimeout(function(){
        const overlay = box.closest('.mos-popup-overlay');
        if(overlay){
            overlay.style.alignItems = 'flex-start';
            overlay.style.overflowY  = 'auto';
            overlay.style.paddingTop = '10px';
        }

        /* ── Set giá trị mặc định cho 2 select Draft font (luôn hiện, không cần popupAnswer) ── */
        const draftNameEl = document.getElementById('pp_oa_draftFontName');
        const draftSizeEl = document.getElementById('pp_oa_draftFontSize');
        if(draftNameEl){ draftNameEl.value = _OA_DEFAULTS.draftFontName; }
        if(draftSizeEl){ draftSizeEl.value = _OA_DEFAULTS.draftFontSize; }

        pp_oaToggleDraftFont();

        body.querySelectorAll('label,input,select,button,div,span').forEach(function(el){
            el.style.fontSize = '14px';
        });
    }, 0);
}

/* ── Toggle mở/khóa ô Name/Size khi bật "Use draft font" ── */
function pp_oaToggleDraftFont(){
    const chk = document.getElementById('pp_oa_useDraftFont');
    const row = document.getElementById('pp_oa_draftInputs');
    if(!chk||!row){return;}
    row.style.opacity       = chk.checked ? '1'    : '0.4';
    row.style.pointerEvents = chk.checked ? 'auto' : 'none';
}

/* ── Hàm check — GIỮ NGUYÊN, chỉ chấm khi field có trong popupAnswer ── */
function checkOptionAdvancedPopup(){
    _hidePopupError('pp_err_optionadv');
    const a = window._ppAns || {};
    let errors = [];

    const chkMap = {
        editA:'pp_oa_editA',   editB:'pp_oa_editB',   editC:'pp_oa_editC',   editD:'pp_oa_editD',
        editE:'pp_oa_editE',   editF:'pp_oa_editF',   editG:'pp_oa_editG',   editH:'pp_oa_editH',
        pasteA:'pp_oa_pasteA', pasteB:'pp_oa_pasteB', pasteC:'pp_oa_pasteC', pasteD:'pp_oa_pasteD',
        showA:'pp_oa_showA',   showB:'pp_oa_showB',   showC:'pp_oa_showC',   showD:'pp_oa_showD',
        showE:'pp_oa_showE',   showF:'pp_oa_showF',
        useDraftFont:'pp_oa_useDraftFont',
        dispA:'pp_oa_dispA',   dispB:'pp_oa_dispB',   dispC:'pp_oa_dispC',   dispD:'pp_oa_dispD',
        dispE:'pp_oa_dispE',   dispF:'pp_oa_dispF',
        printA:'pp_oa_printA', printB:'pp_oa_printB', printC:'pp_oa_printC', printD:'pp_oa_printD',
        printE:'pp_oa_printE',
        wprintA:'pp_oa_wprintA', wprintB:'pp_oa_wprintB',
        saveA:'pp_oa_saveA',   saveB:'pp_oa_saveB',   saveC:'pp_oa_saveC',   saveD:'pp_oa_saveD',
        fidelA:'pp_oa_fidelA', fidelB:'pp_oa_fidelB',
        genA:'pp_oa_genA',     genB:'pp_oa_genB',     genC:'pp_oa_genC',     genD:'pp_oa_genD',
    };

    Object.keys(chkMap).forEach(function(field){
        if(a[field] === undefined){return;}
        const el = document.getElementById(chkMap[field]);
        const val = el ? el.checked : false;
        if(val !== a[field]){ errors.push(field+'→'+a[field]); }
    });

    const inputMap = {
        draftFontName: 'pp_oa_draftFontName',
        draftFontSize: 'pp_oa_draftFontSize',
        dispNum1:      'pp_oa_dispNum1',
        dispNum2:      'pp_oa_dispNum2',
        dispNum3:      'pp_oa_dispNum3',
        dispUnit:      'pp_oa_dispUnit',
        stylesWidth:   'pp_oa_stylesWidth',
    };
    Object.keys(inputMap).forEach(function(field){
        if(a[field] === undefined){return;} /* ← chỉ chấm khi popupAnswer có khai báo */
        const el = document.getElementById(inputMap[field]);
        const val = el ? (el.value||'').toString().trim() : '';
        if(val !== String(a[field]).trim()){ errors.push(field+'→"'+a[field]+'"'); }
    });

    if(errors.length){
        _showPopupError('pp_err_optionadv', '❌ Chưa đúng! ' + errors.join(' | '));
        return;
    }
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   36. POPUP SYMBOL — TAB SPECIAL CHARACTERS //copy vào HTML
//thêm ký hiệu:	    { char:'©', name:'Copyright',  shortcut:'Alt+Ctrl+C' },
// khớp cột Name trong bảng bên dưới: Copyright | Registered | Trademark | Section | Paragraph
   ============================================================
popupType: 'symbol-special',
popupAnswer: {
    	symbolName: 'Copyright' }},
============================================================ */

/* ── Danh sách ký tự đặc biệt — thêm dòng mới vào mảng này khi cần bổ sung sau này ──
   Mỗi dòng: { char: ký tự hiển thị, name: tên để so khớp popupAnswer.symbolName, shortcut: phím tắt (để trống nếu không có) } */
var _SYM_SPECIAL_LIST = [
    { char:'©', name:'Copyright',  shortcut:'Alt+Ctrl+C' },
    { char:'®', name:'Registered', shortcut:'Alt+Ctrl+R' },
    { char:'™', name:'Trademark',  shortcut:'Alt+Ctrl+T' },
    { char:'§', name:'Section',    shortcut:'' },
    { char:'¶', name:'Paragraph',  shortcut:'' },
];

function openSymbolSpecialPopup(step){
    const box = _createPopupShell('Symbol');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        symbolName: ('symbolName' in ans) ? ans.symbolName : undefined,
    };
    window._ppSymSelected = null;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:420px;max-width:520px;gap:0;padding:0;font-size:14px;';

    /* Tab bar: Symbols | Special Characters */
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;border-bottom:1px solid #cbd5e1;background:#f1f5f9;padding:0 8px;';
    tabBar.innerHTML = `
        <button style="padding:6px 14px;font-size:14px;border:none;cursor:pointer;
            border-bottom:2px solid transparent;background:none;color:#64748b;">Symbols</button>
        <button style="padding:6px 14px;font-size:14px;border:none;cursor:pointer;
            border-bottom:2px solid #2563eb;background:none;font-weight:bold;color:#2563eb;">
            Special Characters</button>`;
    body.appendChild(tabBar);

    /* Bảng danh sách — có thanh cuộn */
    const listWrap = document.createElement('div');
    listWrap.style.cssText = 'padding:10px 14px 4px;';

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'border:1px solid #94a3b8;border-radius:3px;'
        +'max-height:220px;overflow-y:auto;background:#fff;';

    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:14px;';

    const thead = document.createElement('tr');
    thead.innerHTML = `
        <th style="text-align:left;padding:6px 10px;background:#e2e8f0;
            border-bottom:1px solid #cbd5e1;font-size:14px;width:60px;">Character</th>
        <th style="text-align:left;padding:6px 10px;background:#e2e8f0;
            border-bottom:1px solid #cbd5e1;font-size:14px;">Name</th>
        <th style="text-align:left;padding:6px 10px;background:#e2e8f0;
            border-bottom:1px solid #cbd5e1;font-size:14px;">Shortcut key</th>`;
    table.appendChild(thead);

    _SYM_SPECIAL_LIST.forEach(function(item){
        const tr = document.createElement('tr');
        tr.dataset.name = item.name;
        tr.style.cssText = 'cursor:pointer;border-bottom:1px solid #f1f5f9;';
        tr.innerHTML = `
            <td style="padding:5px 10px;font-size:18px;text-align:center;">${item.char}</td>
            <td style="padding:5px 10px;font-size:14px;color:#374151;">${item.name}</td>
            <td style="padding:5px 10px;font-size:14px;color:#64748b;">${item.shortcut||''}</td>`;
        tr.addEventListener('mouseenter', function(){
            if(window._ppSymSelected!==item.name) tr.style.background='#eff6ff';
        });
        tr.addEventListener('mouseleave', function(){
            if(window._ppSymSelected!==item.name) tr.style.background='';
        });
        tr.addEventListener('click', function(){ pp_symSelect(item.name); });
        table.appendChild(tr);
    });

    tableWrap.appendChild(table);
    listWrap.appendChild(tableWrap);
    body.appendChild(listWrap);

    /* Character code — mô phỏng ô hiển thị mã Unicode giống Word thật */
    const codeRow = document.createElement('div');
    codeRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 14px;font-size:14px;';
    codeRow.innerHTML = `
        <label style="font-size:14px;">Character code:</label>
        <input type="text" id="pp_symCode" readonly
            style="width:70px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;
                   font-size:14px;background:#f8fafc;text-align:center;">
        <label style="font-size:14px;">from:</label>
        <select style="font-size:14px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
            <option>Unicode (hex)</option>
        </select>`;
    body.appendChild(codeRow);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_symspecial';
    errDiv.style.margin = '0 14px 6px';
    body.appendChild(errDiv);

    /* Nút hành động */
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;'
        +'padding:8px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn" style="font-size:14px;padding:4px 12px;">Shortcut Key...</button>
        <div style="display:flex;gap:6px;">
            <button class="pp-btn pp-btn-ok" onclick="checkSymbolSpecialPopup()"
                style="font-size:14px;padding:4px 16px;">Insert</button>
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()"
                style="font-size:14px;">Cancel</button>
        </div>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button,td,th').forEach(function(el){
        el.style.fontSize = '14px';
    });
}

/* Chọn 1 dòng trong bảng */
function pp_symSelect(name){
    _hidePopupError('pp_err_symspecial');
    window._ppSymSelected = name;

    document.querySelectorAll('tr[data-name]').forEach(function(tr){
        tr.style.background = (tr.dataset.name===name) ? '#dbeafe' : '';
    });

    const item = _SYM_SPECIAL_LIST.find(function(i){ return i.name===name; });
    const codeEl = document.getElementById('pp_symCode');
    if(item && codeEl){
        codeEl.value = item.char.codePointAt(0).toString(16).toUpperCase();
    }
}

/* Hàm check */
function checkSymbolSpecialPopup(){
    _hidePopupError('pp_err_symspecial');
    const a = window._ppAns||{};

    if(!window._ppSymSelected){
        _showPopupError('pp_err_symspecial','⚠️ Hãy chọn 1 ký tự trước khi Insert.');
        return;
    }
    if(a.symbolName && window._ppSymSelected !== a.symbolName){
        _showPopupError('pp_err_symspecial','❌ Chưa đúng! Yêu cầu chọn: <b>'+a.symbolName+'</b>');
        return;
    }

    closeMosPopup(); checkCorrect();
}

/* ============================================================
   37. POPUP PRINT — HỘP THOẠI IN TÀI LIỆU (File > Print) //copy vào HTML
		// pageSetup: true 	-> khi kết hợp Setting và Page setup
   popupType: 'print',
   popupAnswer: {
    copies: 1,
    printRange:   'Custom Print',
    customPages:  '',            
    oneSided:     true,
    collated:     true,
    orientation:  'Portrait',
    paperSize:    'A4',
    margins:      'Normal',
    pagesPerSheet:'1',
    printerName:  'Microsoft Print to PDF',
    pageSetup: false  }},
   ============================================================
popupType: 'print',
popupAnswer: {
    copies: 2,
    printRange:   'Custom Print',
    customPages:  '1-3,5',               // ô nhập LUÔN trống khi mở, học sinh tự gõ — không lộ đáp án
    oneSided:     true,
    collated:     true,
    orientation:  'Portrait',
    paperSize:    'A4',
    margins:      'Normal',
    pagesPerSheet:'1',
    printerName:  'Microsoft Print to PDF',
    // ── MỚI: nếu bước này yêu cầu mở Page Setup thay vì xác nhận in ──
    pageSetup: true,   // true = đáp án đúng là bấm nút "Page Setup" | false/không khai báo = bấm nhầm không đóng popup
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
/* ── Giá trị hiển thị mặc định khi MỞ popup — CỐ ĐỊNH, không đọc từ ans ── */
const _PR_DEFAULTS = {
    copies: 1,
    printerName: 'Microsoft Print to PDF',
    printRange: 'All Pages',
    oneSided: true,
    collated: true,
    orientation: 'Portrait',
    paperSize: 'A4',
    margins: 'Normal',
    pagesPerSheet: '1',
};
function openPrintPopup(step){
    const box = _createPopupShell('Print');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        copies:        ('copies'        in ans) ? ans.copies        : undefined,
        printRange:    ('printRange'    in ans) ? ans.printRange    : undefined,
        customPages:   ('customPages'   in ans) ? ans.customPages   : undefined,
        oneSided:      ('oneSided'      in ans) ? ans.oneSided      : undefined,
        collated:      ('collated'      in ans) ? ans.collated      : undefined,
        orientation:   ('orientation'   in ans) ? ans.orientation   : undefined,
        paperSize:     ('paperSize'     in ans) ? ans.paperSize     : undefined,
        margins:       ('margins'       in ans) ? ans.margins       : undefined,
        pagesPerSheet: ('pagesPerSheet' in ans) ? ans.pagesPerSheet : undefined,
        printerName:   ('printerName'   in ans) ? ans.printerName   : undefined,
        pageSetup:     ('pageSetup'     in ans) ? ans.pageSetup     : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:560px;max-width:640px;gap:0;padding:0;font-size:14px;';

    const content = document.createElement('div');
    content.style.cssText = 'padding:14px 16px;max-height:65vh;overflow-y:auto;'
        +'display:grid;grid-template-columns:1fr 220px;gap:16px;align-items:start;';
    body.appendChild(content);

    /* ══ CỘT TRÁI: Tùy chọn in ══ */
    const left = document.createElement('div');
    left.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
    left.innerHTML = `
      <button class="pp-btn pp-btn-ok" style="align-self:flex-start;padding:8px 26px;font-size:16px;">🖨 Print</button>

      <div style="display:grid;grid-template-columns:auto 70px;gap:6px;align-items:center;">
          <label>Copies:</label>
          <div style="display:flex;align-items:center;gap:4px;">
              <input type="number" id="pp_pr_copies" min="1" value="1"
                  style="width:50px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
              <div style="display:flex;flex-direction:column;gap:1px;">
                  <button type="button" onclick="pp_prStepCopies(1)"
                      style="width:18px;height:13px;font-size:9px;padding:0;border:1px solid #94a3b8;border-radius:2px;background:#f1f5f9;cursor:pointer;line-height:1;">▲</button>
                  <button type="button" onclick="pp_prStepCopies(-1)"
                      style="width:18px;height:13px;font-size:9px;padding:0;border:1px solid #94a3b8;border-radius:2px;background:#f1f5f9;cursor:pointer;line-height:1;">▼</button>
              </div>
          </div>
      </div>

      <div class="pp-group-title" style="margin-top:2px;">Printer</div>
      <select id="pp_pr_printerName" style="width:100%;">
          <option>Microsoft Print to PDF</option>
          <option>Send To OneNote 2016</option>
          <option>Fax</option>
          <option>HP LaserJet (offline)</option>
      </select>
      <div style="font-size:14px;color:#2563eb;cursor:pointer;">Printer Properties</div>

      <div class="pp-group-title">Settings</div>

      <select id="pp_pr_range" onchange="pp_prToggleCustomPages()" style="width:100%;">
          <option value="All Pages">--Print All Pages--</option>
          <option value="Selection">Print Selection</option>
          <option value="Current Page">Print Current Page</option>
          <option value="Custom Print">--Custom Print--</option>
          <option value="Print Markup">--Print Markup--</option>
          <option value="Only Print Odd Pages">Only Print Odd Pages</option>
          <option value="Only Print Even Pages">Only Print Even Pages</option>
      </select>
      <input type="text" id="pp_pr_customPages" placeholder="Nhập trang, VD: 1-3,5" disabled class="pp-disabled"
          style="width:100%;padding:5px 8px;border:1px solid #94a3b8;border-radius:3px;">

      <select id="pp_pr_oneSided" style="width:100%;">
          <option value="true">Print One Sided</option>
          <option value="false">Manually Print on Both Sides</option>
      </select>

      <select id="pp_pr_collated" style="width:100%;">
          <option value="true">Collated  --1,2,3  1,2,3  1,2,3--</option>
          <option value="false">Uncollated  --1,1,1  2,2,2  3,3,3--</option>
      </select>

      <select id="pp_pr_orientation" style="width:100%;">
          <option value="Portrait">Portrait Orientation</option>
          <option value="Landscape">Landscape Orientation</option>
      </select>

      <select id="pp_pr_paperSize" style="width:100%;">
          <option value="Letter">Letter (8.5" x 11")</option>
          <option value="A4">A4 (21cm x 29.7cm)</option>
          <option value="Legal">Legal (8.5" x 14")</option>
          <option value="A5">A5 (14.8cm x 21cm)</option>
      </select>

      <select id="pp_pr_margins" style="width:100%;">
          <option value="Normal">Normal Margins</option>
          <option value="Narrow">Narrow Margins</option>
          <option value="Moderate">Moderate Margins</option>
          <option value="Wide">Wide Margins</option>
          <option value="Mirrored">Mirrored Margins</option>
          <option value="Custom Margins">Custom Margins</option>
      </select>

      <select id="pp_pr_pagesPerSheet" style="width:100%;">
          <option value="1">1 Page Per Sheet</option>
          <option value="2">2 Pages Per Sheet</option>
          <option value="4">4 Pages Per Sheet</option>
          <option value="6">6 Pages Per Sheet</option>
          <option value="8">8 Pages Per Sheet</option>
          <option value="16">16 Pages Per Sheet</option>
      </select>

      <button type="button" class="pp-btn" onclick="pp_prPageSetupClick()"
          style="width:100%;text-align:left;background:#fff;border:1px solid #94a3b8;
                 padding:6px 10px;font-size:14px;color:#2563eb;font-weight:600;border-radius:4px;cursor:pointer;">
          📄 Page Setup
      </button>
    `;
    content.appendChild(left);

    /* ══ CỘT PHẢI: Xem trước ══ */
    const right = document.createElement('div');
    right.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;';
    right.innerHTML = `
      <div id="pp_pr_preview"
          style="width:150px;height:194px;border:1px solid #94a3b8;background:#fff;
                 box-shadow:1px 1px 6px rgba(0,0,0,0.15);position:relative;">
          <div style="position:absolute;inset:16px;display:flex;flex-direction:column;gap:5px;">
              <div style="height:5px;background:#e5e7eb;border-radius:1px;"></div>
              <div style="height:5px;background:#e5e7eb;border-radius:1px;"></div>
              <div style="height:5px;background:#e5e7eb;border-radius:1px;width:70%;"></div>
              <div style="height:5px;background:#e5e7eb;border-radius:1px;margin-top:6px;"></div>
              <div style="height:5px;background:#e5e7eb;border-radius:1px;"></div>
          </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:14px;">
          <button type="button" class="pp-btn" style="padding:2px 8px;">◀</button>
          <span>1 of 1</span>
          <button type="button" class="pp-btn" style="padding:2px 8px;">▶</button>
      </div>
      <input type="range" min="10" max="200" value="100" style="width:140px;">
    `;
    content.appendChild(right);

    /* Error */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_print';
    errDiv.style.margin = '0 16px 8px';
    body.appendChild(errDiv);

    /* Nút hành động */
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;'
        +'padding:10px 16px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkPrintPopup()">✔ Xác nhận in</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button,div,span').forEach(function(el){
        el.style.fontSize = '14px';
    });

    /* Set giá trị mặc định theo popupAnswer */
setTimeout(function(){
        document.getElementById('pp_pr_copies').value = _PR_DEFAULTS.copies;
        document.getElementById('pp_pr_printerName').value = _PR_DEFAULTS.printerName;
        document.getElementById('pp_pr_range').value = _PR_DEFAULTS.printRange;
        document.getElementById('pp_pr_customPages').value = '';
        pp_prToggleCustomPages();
        document.getElementById('pp_pr_oneSided').value = String(_PR_DEFAULTS.oneSided);
        document.getElementById('pp_pr_collated').value = String(_PR_DEFAULTS.collated);
        document.getElementById('pp_pr_orientation').value = _PR_DEFAULTS.orientation;
        document.getElementById('pp_pr_paperSize').value = _PR_DEFAULTS.paperSize;
        document.getElementById('pp_pr_margins').value = _PR_DEFAULTS.margins;
        document.getElementById('pp_pr_pagesPerSheet').value = _PR_DEFAULTS.pagesPerSheet;
    }, 0);
}

/* Tăng/giảm số bản copy */
function pp_prStepCopies(delta){
    const el = document.getElementById('pp_pr_copies');
    if(!el){return;}
    const v = parseInt(el.value)||1;
    el.value = Math.max(1, v+delta);
}

/* Bật/tắt ô nhập trang khi chọn Custom Print */
function pp_prToggleCustomPages(){
    const sel = document.getElementById('pp_pr_range');
    const inp = document.getElementById('pp_pr_customPages');
    if(!sel||!inp){return;}
    const isCustom = (sel.value === 'Custom Print');
    inp.disabled = !isCustom;
    inp.className = isCustom ? '' : 'pp-disabled';
    if(!isCustom){ inp.value=''; }
}

/* ── Nút "Page Setup" — mô phỏng link mở Page Setup trên màn hình Print thật của Word ──
   Chỉ khi popupAnswer khai báo pageSetup:true thì bấm nút này mới là hành động ĐÚNG và đóng bước.
   Mặc định (không khai báo hoặc false) -> bấm nhầm KHÔNG đóng popup. */
function pp_prPageSetupClick(){
    _hidePopupError('pp_err_print');
    const a = window._ppAns||{};
    if(a.pageSetup === true){
        closeMosPopup();
        checkCorrect();
    } else {
        _showPopupError('pp_err_print','❌ Không cần mở Page Setup ở bước này.');
    }
}

function checkPrintPopup(){
    _hidePopupError('pp_err_print');
    const a = window._ppAns||{};

    /* ── Nếu đáp án đúng của bước này là bấm "Page Setup", thì bấm "Xác nhận in"
       (dù điền đúng hết các mục khác) vẫn KHÔNG được tính đúng ── */
    if(a.pageSetup === true){
        _showPopupError('pp_err_print','❌ Bước này yêu cầu bấm nút "Page Setup", không phải "Xác nhận in".');
        return;
    }

    const copies         = parseInt(document.getElementById('pp_pr_copies').value)||0;
    const printerName     = document.getElementById('pp_pr_printerName').value;
    const printRange      = document.getElementById('pp_pr_range').value;
    const customPages      = document.getElementById('pp_pr_customPages').value;
    const oneSided        = document.getElementById('pp_pr_oneSided').value === 'true';
    const collated        = document.getElementById('pp_pr_collated').value === 'true';
    const orientation      = document.getElementById('pp_pr_orientation').value;
    const paperSize        = document.getElementById('pp_pr_paperSize').value;
    const margins          = document.getElementById('pp_pr_margins').value;
    const pagesPerSheet    = document.getElementById('pp_pr_pagesPerSheet').value;

    let errors=[];
    if(a.copies    !==undefined&&(isNaN(copies)||copies!==a.copies))  errors.push('Copies→'+a.copies);
    if(a.printerName && printerName!==a.printerName)                  errors.push('Printer→'+a.printerName);
    if(a.printRange  && printRange !==a.printRange)                   errors.push('Print range→'+a.printRange);
    if(a.printRange==='Custom Print' && a.customPages!==undefined && customPages.trim()!==a.customPages)
        errors.push('Pages→"'+a.customPages+'"');
    if(a.oneSided       !==undefined&&oneSided     !==a.oneSided)        errors.push('One sided→'+a.oneSided);
    if(a.collated       !==undefined&&collated     !==a.collated)        errors.push('Collated→'+a.collated);
    if(a.orientation    && orientation !==a.orientation)                 errors.push('Orientation→'+a.orientation);
    if(a.paperSize      && paperSize   !==a.paperSize)                   errors.push('Paper size→'+a.paperSize);
    if(a.margins        && margins     !==a.margins)                     errors.push('Margins→'+a.margins);
    if(a.pagesPerSheet  && pagesPerSheet!==a.pagesPerSheet)              errors.push('Pages per sheet→'+a.pagesPerSheet);

    if(errors.length){_showPopupError('pp_err_print','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}


/* ============================================================
   38. POPUP FOOTNOTE AND ENDNOTE — mũi tên mở rộng nhóm Footnotes, thẻ References //copy vào HTML
popupType: 'footnote-endnote',
popupAnswer: {
    location:          'Footnotes',          
    footnotePlacement: 'Bottom of page',       
    endnotePlacement:  'End of document',     
    columns:           'Match section layout', 
    numberFormat:      '1, 2, 3, ...',       
    customMark:        '',                   
    startAt:           1,
    numbering:         'Continuous',          
    applyTo:           'Whole document',       
    convertAction:     undefined,            
    action:            'Insert'  ,
    requireApplyFirst: true } },
// Ghi chú 1. chỉ chèn(action: 'Insert') ; 2. chỉ áp dụng(action: 'Apply') ; 3. Áp dụng+Chèn(action: 'Insert', requireApplyFirst: true)
   ============================================================
popupType: 'footnote-endnote',
popupAnswer: {
    location:          'Footnotes',           // 'Footnotes' | 'Endnotes'
    footnotePlacement: 'Bottom of page',       // 'Bottom of page'|'Below text'        — chỉ chấm khi location:'Footnotes'
    endnotePlacement:  'End of document',      // 'End of section'|'End of document'    — chỉ chấm khi location:'Endnotes'
    columns:           'Match section layout', // '1 column'|'2 columns'|'3 columns'|'4 columns'
    numberFormat:      '1, 2, 3, ...',         // '1, 2, 3, ...'|'a, b, c, ...'|'i, ii, iii, ...'|'*, †, ‡, §, ...'
    customMark:        '†',                    // để trống '' nếu không dùng ký hiệu tùy chỉnh, hoặc không khai báo field này
    startAt:           1,
    numbering:         'Continuous',           // 'Continuous'|'Restart each section'|'Restart each page'
    applyTo:           'Whole document',       // 'This section'|'Whole document'
    convertAction:     undefined,              // 'Convert all footnotes to endnotes'|'Convert all endnotes to footnotes'|'Swap footnotes and endnotes' — chỉ khai báo khi câu hỏi có yêu cầu Convert
    action:            'Insert',               // 'Insert'|'Apply' — nút cần bấm để hoàn thành; không khai báo = cả 2 nút đều được
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
/* ── Giá trị hiển thị mặc định khi MỞ popup — CỐ ĐỊNH, không đọc từ ans ── */
const _FN_DEFAULTS = {
    footnotePlacement: 'Bottom of page',
    endnotePlacement: 'End of document',
    columns: 'Match section layout',
    numberFormat: '1, 2, 3, ...',
    startAt: 1,
    numbering: 'Continuous',
    applyTo: 'Whole document',
};
function openFootnoteEndnotePopup(step){
    const box = _createPopupShell('Footnote and Endnote');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        location:          ('location'          in ans) ? ans.location          : undefined,
        footnotePlacement: ('footnotePlacement' in ans) ? ans.footnotePlacement : undefined,
        endnotePlacement:  ('endnotePlacement'  in ans) ? ans.endnotePlacement  : undefined,
        columns:           ('columns'           in ans) ? ans.columns           : undefined,
        numberFormat:      ('numberFormat'      in ans) ? ans.numberFormat      : undefined,
        customMark:        ('customMark'        in ans) ? ans.customMark        : undefined,
        startAt:           ('startAt'           in ans) ? ans.startAt           : undefined,
        numbering:         ('numbering'         in ans) ? ans.numbering         : undefined,
        applyTo:           ('applyTo'           in ans) ? ans.applyTo           : undefined,
        convertAction:     ('convertAction'     in ans) ? ans.convertAction     : undefined,
        action:            ('action'            in ans) ? ans.action            : undefined,
    };
    window._ppFnConvertSelected = null;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:400px;max-width:560px;gap:0;padding:0;font-size:14px;';

    /* ── Khung nội dung có thanh cuộn khi chiều dọc vượt khung ── */
    const content = document.createElement('div');
    content.style.cssText = 'padding:14px 16px;max-height:65vh;overflow-y:auto;'
        +'display:flex;flex-direction:column;gap:4px;';
    body.appendChild(content);

    content.innerHTML += `
    <div class="pp-group-title" style="margin-top:0;">Location</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <label style="display:flex;align-items:center;gap:6px;min-width:100px;white-space:nowrap;">
            <input type="radio" name="pp_fn_location" id="pp_fn_locFootnotes" value="Footnotes"
                onchange="pp_fnSelectLocation('Footnotes')"> Footnotes:
        </label>
        <select id="pp_fn_footnotePlacement" style="flex:1;">
            <option value="Bottom of page">Bottom of Page</option>
            <option value="Below text">Below text</option>
        </select>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <label style="display:flex;align-items:center;gap:6px;min-width:100px;white-space:nowrap;">
            <input type="radio" name="pp_fn_location" id="pp_fn_locEndnotes" value="Endnotes"
                onchange="pp_fnSelectLocation('Endnotes')"> Endnotes:
        </label>
        <select id="pp_fn_endnotePlacement" style="flex:1;">
            <option value="End of document">End of Document</option>
            <option value="End of section">End of Section</option>
        </select>
    </div>

    <button type="button" class="pp-btn" onclick="pp_fnToggleConvert()"
        style="align-self:flex-start;font-size:14px;padding:4px 14px;margin-bottom:4px;">Convert...</button>

    <div id="pp_fn_convertPanel" style="display:none;border:1px solid #cbd5e1;border-radius:4px;
        padding:8px 10px;margin-bottom:6px;background:#f8fafc;">
        <div class="pp-radio-group">
            <label><input type="radio" name="pp_fn_convert" value="Convert all footnotes to endnotes"> Convert all Footnotes to Endnotes</label>
            <label><input type="radio" name="pp_fn_convert" value="Convert all endnotes to footnotes"> Convert all Endnotes to Footnotes</label>
            <label><input type="radio" name="pp_fn_convert" value="Swap footnotes and endnotes"> Swap Footnotes and Endnotes</label>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px;">
            <button class="pp-btn pp-btn-ok" onclick="pp_fnConvertOK()">OK</button>
            <button class="pp-btn pp-btn-cancel" onclick="pp_fnConvertCancel()">Cancel</button>
        </div>
    </div>

    <div class="pp-group-title">Footnote layout</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <label style="min-width:100px;">Columns:</label>
        <select id="pp_fn_columns" style="flex:1;">
            <option value="Match section layout">Match section layout</option>
            <option value="1 column">1 column</option>
            <option value="2 columns">2 columns</option>
            <option value="3 columns">3 columns</option>
            <option value="4 columns">4 columns</option>
        </select>
    </div>

    <div class="pp-group-title">Format</div>
    <div style="display:grid;grid-template-columns:100px 1fr;gap:6px 8px;align-items:center;margin-bottom:6px;">
        <label>Number format:</label>
        <select id="pp_fn_numberFormat">
            <option value="1, 2, 3, ...">1, 2, 3, ...</option>
            <option value="a, b, c, ...">a, b, c, ...</option>
            <option value="i, ii, iii, ...">i, ii, iii, ...</option>
            <option value="*, †, ‡, §, ...">*, †, ‡, §, ...</option>
        </select>

        <label>Custom mark:</label>
        <div style="display:flex;gap:6px;position:relative;">
            <input type="text" id="pp_fn_customMark" maxlength="3" placeholder="(none)"
                style="width:60px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
            <button type="button" class="pp-btn" onclick="pp_fnToggleSymbolPicker()"
                style="font-size:14px;padding:3px 10px;">Symbol...</button>
            <div id="pp_fn_symbolPicker" style="display:none;position:absolute;top:100%;left:70px;
                background:#fff;border:1px solid #94a3b8;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.15);
                padding:6px;z-index:20;display:flex;gap:6px;">
            </div>
        </div>

        <label>Start at:</label>
        <div style="display:flex;align-items:center;gap:4px;">
            <input type="number" id="pp_fn_startAt" min="1" value="1"
                style="width:60px;padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;">
            <div style="display:flex;flex-direction:column;gap:1px;">
                <button type="button" onclick="pp_fnStepStartAt(1)"
                    style="width:18px;height:13px;font-size:9px;padding:0;border:1px solid #94a3b8;border-radius:2px;background:#f1f5f9;cursor:pointer;line-height:1;">▲</button>
                <button type="button" onclick="pp_fnStepStartAt(-1)"
                    style="width:18px;height:13px;font-size:9px;padding:0;border:1px solid #94a3b8;border-radius:2px;background:#f1f5f9;cursor:pointer;line-height:1;">▼</button>
            </div>
        </div>

        <label>Numbering:</label>
        <select id="pp_fn_numbering">
            <option value="Continuous">Continuous</option>
            <option value="Restart each section">Restart each section</option>
            <option value="Restart each page">Restart each page</option>
        </select>
    </div>

    <div class="pp-group-title">Apply changes</div>
    <div style="display:flex;align-items:center;gap:8px;">
        <label style="min-width:100px;">Apply to:</label>
        <select id="pp_fn_applyTo" style="flex:1;">
            <option value="Whole document">Whole document</option>
            <option value="This section">This section</option>
        </select>
    </div>
    `;

    /* Điền chip biểu tượng nhanh cho Custom mark (giống Symbol picker rút gọn) */
    const symChoices = ['†','‡','§','¶','※','✦'];
    setTimeout(function(){
        const picker = document.getElementById('pp_fn_symbolPicker');
        if(picker){
            symChoices.forEach(function(ch){
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.textContent = ch;
                chip.style.cssText = 'width:26px;height:26px;font-size:16px;border:1px solid #cbd5e1;'
                    +'border-radius:3px;background:#fff;cursor:pointer;';
                chip.addEventListener('click', function(){
                    document.getElementById('pp_fn_customMark').value = ch;
                    picker.style.display = 'none';
                });
                picker.appendChild(chip);
            });
        }
    }, 0);

    /* Error */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_footnote';
    errDiv.style.margin = '6px 0 0';
    content.appendChild(errDiv);

    /* Nút hành động */
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;'
        +'padding:10px 16px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn" onclick="pp_fnApply()">Apply</button>
        <button class="pp-btn pp-btn-ok" onclick="pp_fnInsert()">Insert</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button,div,span').forEach(function(el){
        el.style.fontSize = '14px';
    });

    /* Set giá trị mặc định theo popupAnswer */
setTimeout(function(){
        document.getElementById('pp_fn_footnotePlacement').value = _FN_DEFAULTS.footnotePlacement;
        document.getElementById('pp_fn_endnotePlacement').value  = _FN_DEFAULTS.endnotePlacement;
        document.getElementById('pp_fn_columns').value            = _FN_DEFAULTS.columns;
        document.getElementById('pp_fn_numberFormat').value       = _FN_DEFAULTS.numberFormat;
        document.getElementById('pp_fn_customMark').value         = '';
        document.getElementById('pp_fn_startAt').value            = _FN_DEFAULTS.startAt;
        document.getElementById('pp_fn_numbering').value          = _FN_DEFAULTS.numbering;
        document.getElementById('pp_fn_applyTo').value            = _FN_DEFAULTS.applyTo;

        document.getElementById('pp_fn_locFootnotes').checked = true;
        pp_fnSelectLocation('Footnotes');
    }, 0);
}

/* ── Chọn Footnotes/Endnotes — khóa dropdown còn lại (giống Word thật) ── */
function pp_fnSelectLocation(val){
    window._ppFnLocation = val;
    const footEl = document.getElementById('pp_fn_footnotePlacement');
    const endEl  = document.getElementById('pp_fn_endnotePlacement');
    if(footEl){ footEl.disabled = (val!=='Footnotes'); footEl.className = (val==='Footnotes')?'':'pp-disabled'; }
    if(endEl){  endEl.disabled  = (val!=='Endnotes');  endEl.className  = (val==='Endnotes') ?'':'pp-disabled'; }
}

/* ── Toggle khung Convert ── */
function pp_fnToggleConvert(){
    const panel = document.getElementById('pp_fn_convertPanel');
    if(!panel){return;}
    panel.style.display = (panel.style.display==='none') ? 'block' : 'none';
}
function pp_fnConvertOK(){
    const sel = document.querySelector('input[name="pp_fn_convert"]:checked');
    window._ppFnConvertSelected = sel ? sel.value : null;
    document.getElementById('pp_fn_convertPanel').style.display = 'none';
}
function pp_fnConvertCancel(){
    document.getElementById('pp_fn_convertPanel').style.display = 'none';
}

/* ── Toggle bảng chọn ký hiệu nhanh cho Custom mark ── */
function pp_fnToggleSymbolPicker(){
    const picker = document.getElementById('pp_fn_symbolPicker');
    if(!picker){return;}
    picker.style.display = (picker.style.display==='none') ? 'flex' : 'none';
}

/* ── Tăng/giảm Start at ── */
function pp_fnStepStartAt(delta){
    const el = document.getElementById('pp_fn_startAt');
    if(!el){return;}
    const v = parseInt(el.value)||1;
    el.value = Math.max(1, v+delta);
}

/* ── Kiểm tra toàn bộ thiết lập — dùng chung cho cả 2 nút Insert/Apply ── */
function _fnValidateSettings(){
    const a = window._ppAns||{};
    const location          = window._ppFnLocation || 'Footnotes';
    const footnotePlacement = document.getElementById('pp_fn_footnotePlacement').value;
    const endnotePlacement  = document.getElementById('pp_fn_endnotePlacement').value;
    const columns           = document.getElementById('pp_fn_columns').value;
    const numberFormat      = document.getElementById('pp_fn_numberFormat').value;
    const customMark        = document.getElementById('pp_fn_customMark').value;
    const startAt           = parseInt(document.getElementById('pp_fn_startAt').value)||0;
    const numbering         = document.getElementById('pp_fn_numbering').value;
    const applyTo           = document.getElementById('pp_fn_applyTo').value;
    const convertAction     = window._ppFnConvertSelected;

    let errors=[];
    if(a.location          && location          !==a.location)          errors.push('Location→'+a.location);
    if(a.footnotePlacement && a.location!=='Endnotes' && footnotePlacement!==a.footnotePlacement)
        errors.push('Footnotes vị trí→'+a.footnotePlacement);
    if(a.endnotePlacement  && a.location==='Endnotes' && endnotePlacement!==a.endnotePlacement)
        errors.push('Endnotes vị trí→'+a.endnotePlacement);
    if(a.columns           && columns           !==a.columns)           errors.push('Columns→'+a.columns);
    if(a.numberFormat      && numberFormat       !==a.numberFormat)      errors.push('Number format→'+a.numberFormat);
    if(a.customMark        !==undefined && customMark.trim()!==a.customMark) errors.push('Custom mark→"'+a.customMark+'"');
    if(a.startAt           !==undefined&&(isNaN(startAt)||startAt!==a.startAt)) errors.push('Start at→'+a.startAt);
    if(a.numbering         && numbering         !==a.numbering)         errors.push('Numbering→'+a.numbering);
    if(a.applyTo           && applyTo           !==a.applyTo)           errors.push('Apply to→'+a.applyTo);
    if(a.convertAction     && convertAction     !==a.convertAction)     errors.push('Convert→'+a.convertAction);

    return errors;
}

function pp_fnInsert(){
    _hidePopupError('pp_err_footnote');
    const a = window._ppAns||{};
    if(a.action && a.action!=='Insert'){
        _showPopupError('pp_err_footnote','❌ Bước này cần bấm nút "'+a.action+'", không phải "Insert".');
        return;
    }
    if(a.requireApplyFirst===true && window._ppFnApplied!==true){
        _showPopupError('pp_err_footnote','❌ Cần bấm "Apply" trước, sau đó mới bấm "Insert".');
        return;
    }
    const errors = _fnValidateSettings();
    if(errors.length){_showPopupError('pp_err_footnote','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

function pp_fnApply(){
    _hidePopupError('pp_err_footnote');
    const a = window._ppAns||{};
    if(a.action && a.action!=='Apply' && !a.requireApplyFirst){
        _showPopupError('pp_err_footnote','❌ Bước này cần bấm nút "'+a.action+'", không phải "Apply".');
        return;
    }
    const errors = _fnValidateSettings();
    if(errors.length){_showPopupError('pp_err_footnote','❌ Chưa đúng! '+errors.join(' | '));return;}

    window._ppFnApplied = true;

    /* Nếu Apply chính là hành động cuối cùng cần làm -> đóng bước luôn */
    if(a.action==='Apply'){
        closeMosPopup(); checkCorrect();
        return;
    }
    /* Ngược lại (action:'Insert' + requireApplyFirst, hoặc không khai báo action)
       -> chỉ áp dụng, KHÔNG đóng popup, chờ bấm Insert tiếp theo */
    _showPopupError('pp_err_footnote','✅ Đã áp dụng thiết lập. Bấm "Insert" để xác nhận chèn.');
    document.getElementById('pp_err_footnote').style.color = '#16a34a';
    document.getElementById('pp_err_footnote').style.background = '#ecfdf5';
    document.getElementById('pp_err_footnote').style.borderColor = '#86efac';
}

/* ============================================================
   39. POPUP FONT MỞ RỘNG (Ctrl+D) — TAB FONT / ADVANCED //copy vào HTML
popupType: 'more-font',
popupAnswer: {
  	scale: '100%', spacing: 'Expanded', spacingBy: 2, position: 'Normal', positionBy: 0, kerning: false, kerningPoints: 1, 
	ligatures: 'None', numberSpacing: 'Default', numberForms: 'Default', stylisticSet: 'Default', contextualAlternates: false ,
	activeTab: 'Advanced'  }},

popupType: 'more-font',
popupAnswer: {
  	font: 'Times New Roman', fontStyle: 'Bold', size: 14, 
	fontColor: 'Blue, Accent 1', underlineStyle: 'Single', underlineColor: 'Automatic', 
	strikethrough: false, doubleStrikethrough: false, superscript: false, subscript: false, smallCaps: false, allCaps: false, hidden: false,
	activeTab: 'Font'  }},
   ============================================================
popupType: 'more-font',
popupAnswer: {
  // ── Tab Font ──
  font: 'Times New Roman',
  fontStyle: 'Bold',                  // 'Regular'|'Italic'|'Bold'|'Bold Italic'
  size: 14,
  fontColor: 'Blue, Accent 1',        // 'Automatic'|'Black, Text 1'|'Blue, Accent 1'|'Red'|'Green'
  underlineStyle: 'Single',           // 'None'|'Single'|'Words only'|'Double'|'Dotted'|'Thick'|'Dash'|'Wave'
  underlineColor: 'Automatic',
  strikethrough: false,
  doubleStrikethrough: false,
  superscript: false,
  subscript: false,
  smallCaps: false,
  allCaps: false,
  hidden: false,

  // ── Tab Advanced ──
  scale: '100%',                       // '200%'|'150%'|'100%'|'90%'|'80%'|'66%'|'50%'|'33%'
  spacing: 'Expanded',                 // 'Normal'|'Expanded'|'Condensed'
  spacingBy: 1.5,                      // pt — chỉ chấm khi spacing khác 'Normal'
  position: 'Normal',                  // 'Normal'|'Raised'|'Lowered'
  positionBy: 0,                        // pt — chỉ chấm khi position khác 'Normal'
  kerning: false,
  kerningPoints: 1,                     // chỉ chấm khi kerning:true
  ligatures: 'None',                    // 'None'|'Standard Only'|'Contextual'|'Historical and Discretionary'|'All'
  numberSpacing: 'Default',             // 'Default'|'Proportional'|'Tabular'
  numberForms: 'Default',               // 'Default'|'Lining'|'Old-style'
  stylisticSet: 'Default',              // 'Default'|'Set 01'|'Set 02'|'Set 03'
  contextualAlternates: false,

  activeTab: 'Font',                     // 'Font'|'Advanced' — tab mặc định không còn tác dụng mở khi vào popup (tùy chọn)
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
/* ── Giá trị hiển thị mặc định khi MỞ popup — CỐ ĐỊNH, không đọc từ ans (tránh lộ đáp án) ── */
const _MF_DEFAULTS = {
    font: 'Times New Roman',
    fontStyle: 'Bold',
    size: 10,
    fontColor: 'Automatic',
    underlineStyle: 'None',
    underlineColor: 'Automatic',
    scale: '100%',
    spacing: 'Normal',
    spacingBy: 0,
    position: 'Normal',
    positionBy: 0,
    kerningPoints: 1,
    ligatures: 'None',
    numberSpacing: 'Default',
    numberForms: 'Default',
    stylisticSet: 'Default',
};
function openMoreFontPopup(step){
    const box = _createPopupShell('Font');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        font:                ('font'                in ans) ? ans.font                : undefined,
        fontStyle:           ('fontStyle'           in ans) ? ans.fontStyle           : undefined,
        size:                ('size'                in ans) ? ans.size                : undefined,
        fontColor:           ('fontColor'           in ans) ? ans.fontColor           : undefined,
        underlineStyle:      ('underlineStyle'      in ans) ? ans.underlineStyle      : undefined,
        underlineColor:      ('underlineColor'      in ans) ? ans.underlineColor      : undefined,
        strikethrough:       ('strikethrough'       in ans) ? ans.strikethrough       : undefined,
        doubleStrikethrough: ('doubleStrikethrough' in ans) ? ans.doubleStrikethrough : undefined,
        superscript:         ('superscript'         in ans) ? ans.superscript         : undefined,
        subscript:           ('subscript'           in ans) ? ans.subscript           : undefined,
        smallCaps:           ('smallCaps'           in ans) ? ans.smallCaps           : undefined,
        allCaps:             ('allCaps'             in ans) ? ans.allCaps             : undefined,
        hidden:              ('hidden'              in ans) ? ans.hidden              : undefined,

        scale:               ('scale'               in ans) ? ans.scale               : undefined,
        spacing:             ('spacing'             in ans) ? ans.spacing             : undefined,
        spacingBy:           ('spacingBy'           in ans) ? ans.spacingBy           : undefined,
        position:            ('position'            in ans) ? ans.position            : undefined,
        positionBy:          ('positionBy'          in ans) ? ans.positionBy          : undefined,
        kerning:             ('kerning'             in ans) ? ans.kerning             : undefined,
        kerningPoints:       ('kerningPoints'       in ans) ? ans.kerningPoints       : undefined,
        ligatures:           ('ligatures'           in ans) ? ans.ligatures           : undefined,
        numberSpacing:       ('numberSpacing'       in ans) ? ans.numberSpacing       : undefined,
        numberForms:         ('numberForms'         in ans) ? ans.numberForms         : undefined,
        stylisticSet:        ('stylisticSet'        in ans) ? ans.stylisticSet        : undefined,
        contextualAlternates:('contextualAlternates'in ans) ? ans.contextualAlternates: undefined,

        activeTab:           ('activeTab'           in ans) ? ans.activeTab           : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:520px;max-width:600px;gap:0;padding:0;font-size:14px;';

    /* ── Tab bar ── */
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;border-bottom:2px solid #94a3b8;padding:0 10px;background:#f1f5f9;';
    const _mfTabs = ['Font','Advanced'];
    const tabEls = {};
    _mfTabs.forEach(function(t){
        const td = document.createElement('div');
        td.textContent = t;
        td.style.cssText = 'padding:7px 16px;cursor:pointer;font-size:14px;'
            +'border:1px solid transparent;border-bottom:none;margin-bottom:-2px;'
            +'border-radius:3px 3px 0 0;color:#374151;';
        td.addEventListener('click', function(){ pp_mfSetTab(t); });
        tabBar.appendChild(td);
        tabEls[t] = td;
    });
    body.appendChild(tabBar);

    /* ── Content scroll area — cuộn dọc khi cao hơn khung hiển thị ── */
    const content = document.createElement('div');
    content.style.cssText = 'padding:14px 16px;max-height:60vh;overflow-y:auto;';
    body.appendChild(content);

    /* ══ PANEL 1: FONT ══ */
    const panelFont = document.createElement('div');
    panelFont.id = 'pp_mf_panel_font';
    panelFont.style.cssText = 'display:block;';
    panelFont.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:start;">
        <div>
          <label style="display:block;margin-bottom:2px;">Font:</label>
          <select id="pp_mf_font" style="width:100%;">
              <option value="Calibri">Calibri</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Cambria">Cambria</option>
              <option value="Tahoma">Tahoma</option>
              <option value="Verdana">Verdana</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:2px;">Font style:</label>
          <select id="pp_mf_fontStyle" style="width:100%;">
              <option value="Regular">Regular</option>
              <option value="Italic">Italic</option>
              <option value="Bold">Bold</option>
              <option value="Bold Italic">Bold Italic</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:2px;">Size:</label>
          <input type="number" id="pp_mf_size" min="1" max="999" value="12" style="width:70px;">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:end;margin-top:10px;">
        <div>
          <label style="display:block;margin-bottom:2px;">Font color:</label>
          <select id="pp_mf_fontColor" style="width:100%;">
              <option value="Automatic">Automatic</option>
              <option value="Black, Text 1">Black, Text 1</option>
              <option value="Blue, Accent 1">Blue, Accent 1</option>
              <option value="Red">Red</option>
              <option value="Green">Green</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:2px;">Underline style:</label>
          <select id="pp_mf_underlineStyle" style="width:100%;">
              <option value="None">(none)</option>
              <option value="Single">Single</option>
              <option value="Words only">Words only</option>
              <option value="Double">Double</option>
              <option value="Dotted">Dotted</option>
              <option value="Thick">Thick</option>
              <option value="Dash">Dash</option>
              <option value="Wave">Wave</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:2px;">Underline color:</label>
          <select id="pp_mf_underlineColor" style="width:100%;">
              <option value="Automatic">Automatic</option>
              <option value="Black, Text 1">Black, Text 1</option>
              <option value="Blue, Accent 1">Blue, Accent 1</option>
              <option value="Red">Red</option>
          </select>
        </div>
      </div>

      <div class="pp-group-title">Effects</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 14px;">
        <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="pp_mf_strikethrough"> Strikethrough</label>
        <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="pp_mf_smallCaps"> Small caps</label>
        <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="pp_mf_doubleStrikethrough"> Double strikethrough</label>
        <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="pp_mf_allCaps"> All caps</label>
        <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="pp_mf_superscript"> Superscript</label>
        <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="pp_mf_hidden"> Hidden</label>
        <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="pp_mf_subscript"> Subscript</label>
      </div>

      <div style="display:flex;gap:8px;margin-top:10px;">
        <button type="button" class="pp-btn" style="font-size:14px;padding:4px 12px;">Set As Default</button>
        <button type="button" class="pp-btn" style="font-size:14px;padding:4px 12px;">Text Effects...</button>
      </div>
    `;
    content.appendChild(panelFont);

    /* ══ PANEL 2: ADVANCED ══ */
    const panelAdvanced = document.createElement('div');
    panelAdvanced.id = 'pp_mf_panel_advanced';
    panelAdvanced.style.cssText = 'display:none;';
    panelAdvanced.innerHTML = `
      <div class="pp-group-title" style="margin-top:0;">Character Spacing</div>
      <div style="display:grid;grid-template-columns:auto 1fr auto 70px;gap:6px 8px;align-items:center;">
        <label>Scale:</label>
        <select id="pp_mf_scale">
            <option value="200%">200%</option>
            <option value="150%">150%</option>
            <option value="100%">100%</option>
            <option value="90%">90%</option>
            <option value="80%">80%</option>
            <option value="66%">66%</option>
            <option value="50%">50%</option>
            <option value="33%">33%</option>
        </select>
        <span></span><span></span>

        <label>Spacing:</label>
        <select id="pp_mf_spacing" onchange="pp_mfToggleSpacingBy()">
            <option value="Normal">Normal</option>
            <option value="Expanded">Expanded</option>
            <option value="Condensed">Condensed</option>
        </select>
        <label id="pp_mf_spacingByLabel" style="color:#94a3b8;">By:</label>
        <input type="number" id="pp_mf_spacingBy" step="0.1" value="0" disabled class="pp-disabled">

        <label>Position:</label>
        <select id="pp_mf_position" onchange="pp_mfTogglePositionBy()">
            <option value="Normal">Normal</option>
            <option value="Raised">Raised</option>
            <option value="Lowered">Lowered</option>
        </select>
        <label id="pp_mf_positionByLabel" style="color:#94a3b8;">By:</label>
        <input type="number" id="pp_mf_positionBy" step="0.1" value="0" disabled class="pp-disabled">
      </div>

      <label style="display:flex;align-items:center;gap:6px;margin-top:8px;">
          <input type="checkbox" id="pp_mf_kerning" onchange="pp_mfToggleKerning()"> Kerning for fonts:
          <input type="number" id="pp_mf_kerningPoints" min="1" value="1" style="width:60px;margin-left:6px;" disabled class="pp-disabled">
          <span id="pp_mf_kerningLabel" style="color:#94a3b8;">Points and above</span>
      </label>

      <div class="pp-group-title">OpenType Features</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 8px;align-items:center;">
        <label>Ligatures:</label>
        <select id="pp_mf_ligatures">
            <option value="None">None</option>
            <option value="Standard Only">Standard Only</option>
            <option value="Contextual">Contextual</option>
            <option value="Historical and Discretionary">Historical and Discretionary</option>
            <option value="All">All</option>
        </select>

        <label>Number spacing:</label>
        <select id="pp_mf_numberSpacing">
            <option value="Default">Default</option>
            <option value="Proportional">Proportional</option>
            <option value="Tabular">Tabular</option>
        </select>

        <label>Number forms:</label>
        <select id="pp_mf_numberForms">
            <option value="Default">Default</option>
            <option value="Lining">Lining</option>
            <option value="Old-style">Old-style</option>
        </select>

        <label>Stylistic sets:</label>
        <select id="pp_mf_stylisticSet">
            <option value="Default">Default</option>
            <option value="Set 01">Set 01</option>
            <option value="Set 02">Set 02</option>
            <option value="Set 03">Set 03</option>
        </select>
      </div>
      <label style="display:flex;align-items:center;gap:6px;margin-top:6px;">
          <input type="checkbox" id="pp_mf_contextualAlternates"> Use Contextual Alternates
      </label>
    `;
    content.appendChild(panelAdvanced);

    /* ── Preview (dùng chung cho cả 2 tab, đặt cố định dưới khung nội dung) ── */
    const previewBox = document.createElement('div');
    previewBox.style.cssText = 'margin:10px 16px 0;border:1px solid #94a3b8;border-radius:4px;'
        +'padding:14px;min-height:60px;display:flex;align-items:center;justify-content:center;background:#fafafa;position:relative;';
    previewBox.innerHTML = `
        <div class="pp-group-title" style="position:absolute;top:-11px;left:8px;margin-top:0;background:#fff;padding:0 4px;">Preview</div>
        <span id="pp_mf_previewText" style="font-size:18px;">AaBbCcYyZz</span>`;
    body.appendChild(previewBox);

    /* Error */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_morefont';
    errDiv.style.margin = '8px 16px 0';
    body.appendChild(errDiv);

    /* Nút hành động */
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;'
        +'padding:10px 16px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkMoreFontPopup()">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button,div,span').forEach(function(el){
        el.style.fontSize = '14px';
    });

/* ── Set giá trị hiển thị mặc định — LUÔN dùng _MF_DEFAULTS, KHÔNG đọc từ ans ── */
    window._ppMfTabEls = tabEls;
    setTimeout(function(){
        document.getElementById('pp_mf_font').value           = _MF_DEFAULTS.font;
        document.getElementById('pp_mf_fontStyle').value      = _MF_DEFAULTS.fontStyle;
        document.getElementById('pp_mf_size').value            = _MF_DEFAULTS.size;
        document.getElementById('pp_mf_fontColor').value      = _MF_DEFAULTS.fontColor;
        document.getElementById('pp_mf_underlineStyle').value = _MF_DEFAULTS.underlineStyle;
        document.getElementById('pp_mf_underlineColor').value = _MF_DEFAULTS.underlineColor;

        document.getElementById('pp_mf_scale').value      = _MF_DEFAULTS.scale;
        document.getElementById('pp_mf_spacing').value    = _MF_DEFAULTS.spacing;
        document.getElementById('pp_mf_spacingBy').value  = _MF_DEFAULTS.spacingBy;
        pp_mfToggleSpacingBy();
        document.getElementById('pp_mf_position').value   = _MF_DEFAULTS.position;
        document.getElementById('pp_mf_positionBy').value = _MF_DEFAULTS.positionBy;
        pp_mfTogglePositionBy();
        document.getElementById('pp_mf_kerningPoints').value = _MF_DEFAULTS.kerningPoints;
        pp_mfToggleKerning();

        document.getElementById('pp_mf_ligatures').value     = _MF_DEFAULTS.ligatures;
        document.getElementById('pp_mf_numberSpacing').value = _MF_DEFAULTS.numberSpacing;
        document.getElementById('pp_mf_numberForms').value   = _MF_DEFAULTS.numberForms;
        document.getElementById('pp_mf_stylisticSet').value  = _MF_DEFAULTS.stylisticSet;

pp_mfSetTab(window._ppAns.activeTab || 'Font');
        pp_mfUpdatePreview();

        ['pp_mf_font','pp_mf_fontStyle','pp_mf_size','pp_mf_fontColor','pp_mf_underlineStyle',
         'pp_mf_strikethrough','pp_mf_doubleStrikethrough','pp_mf_superscript','pp_mf_subscript',
         'pp_mf_smallCaps','pp_mf_allCaps','pp_mf_hidden'].forEach(function(id){
            const el = document.getElementById(id);
            if(el){ el.addEventListener('change', pp_mfUpdatePreview); el.addEventListener('input', pp_mfUpdatePreview); }
        });
    }, 0);
}

/* ── Chuyển tab (Font / Advanced) ── */
function pp_mfSetTab(tab){
    const tabEls = window._ppMfTabEls || {};
    ['Font','Advanced'].forEach(function(t){
        const el = tabEls[t];
        if(!el){return;}
        if(t===tab){
            el.style.background   = '#fff';
            el.style.border       = '1px solid #94a3b8';
            el.style.borderBottom = '2px solid #fff';
            el.style.fontWeight   = 'bold';
            el.style.color        = '#1e3a5f';
        } else {
            el.style.background   = '';
            el.style.border       = '1px solid transparent';
            el.style.fontWeight   = 'normal';
            el.style.color        = '#374151';
        }
    });
    const pf = document.getElementById('pp_mf_panel_font');
    const pa = document.getElementById('pp_mf_panel_advanced');
    if(pf) pf.style.display = (tab==='Font')     ? 'block' : 'none';
    if(pa) pa.style.display = (tab==='Advanced') ? 'block' : 'none';
    window._ppMfActiveTab = tab;
}

/* ── Bật/tắt ô "By:" của Spacing khi khác Normal ── */
function pp_mfToggleSpacingBy(){
    const sel = document.getElementById('pp_mf_spacing');
    const inp = document.getElementById('pp_mf_spacingBy');
    const lbl = document.getElementById('pp_mf_spacingByLabel');
    if(!sel||!inp){return;}
    const on = sel.value !== 'Normal';
    inp.disabled = !on; inp.className = on?'':'pp-disabled';
    if(lbl) lbl.style.color = on?'#374151':'#94a3b8';
}
/* ── Bật/tắt ô "By:" của Position khi khác Normal ── */
function pp_mfTogglePositionBy(){
    const sel = document.getElementById('pp_mf_position');
    const inp = document.getElementById('pp_mf_positionBy');
    const lbl = document.getElementById('pp_mf_positionByLabel');
    if(!sel||!inp){return;}
    const on = sel.value !== 'Normal';
    inp.disabled = !on; inp.className = on?'':'pp-disabled';
    if(lbl) lbl.style.color = on?'#374151':'#94a3b8';
}
/* ── Bật/tắt ô "Points and above" khi tick Kerning ── */
function pp_mfToggleKerning(){
    const chk = document.getElementById('pp_mf_kerning');
    const inp = document.getElementById('pp_mf_kerningPoints');
    const lbl = document.getElementById('pp_mf_kerningLabel');
    if(!chk||!inp){return;}
    const on = chk.checked;
    inp.disabled = !on; inp.className = on?'':'pp-disabled';
    if(lbl) lbl.style.color = on?'#374151':'#94a3b8';
}

/* ── Cập nhật Preview realtime theo Font tab ── */
function pp_mfUpdatePreview(){
    const el = document.getElementById('pp_mf_previewText');
    if(!el){return;}
    const font       = document.getElementById('pp_mf_font').value;
    const fontStyle  = document.getElementById('pp_mf_fontStyle').value;
    const size       = parseInt(document.getElementById('pp_mf_size').value)||12;
    const underline  = document.getElementById('pp_mf_underlineStyle').value;
    const strike     = document.getElementById('pp_mf_strikethrough').checked;
    const smallCaps  = document.getElementById('pp_mf_smallCaps').checked;
    const allCaps    = document.getElementById('pp_mf_allCaps').checked;
    const hidden     = document.getElementById('pp_mf_hidden').checked;

    el.style.fontFamily   = font;
    el.style.fontWeight   = (fontStyle==='Bold'||fontStyle==='Bold Italic') ? 'bold' : 'normal';
    el.style.fontStyle    = (fontStyle==='Italic'||fontStyle==='Bold Italic') ? 'italic' : 'normal';
    el.style.fontSize     = Math.min(size,28)+'px';
    el.style.textDecoration = (underline!=='None' ? 'underline ' : '') + (strike ? 'line-through' : '');
    el.style.textTransform = allCaps ? 'uppercase' : (smallCaps ? 'uppercase' : 'none');
    el.style.opacity      = hidden ? '0.25' : '1';
}

function checkMoreFontPopup(){
    _hidePopupError('pp_err_morefont');
    const a = window._ppAns||{};

    const font           = document.getElementById('pp_mf_font').value;
    const fontStyle      = document.getElementById('pp_mf_fontStyle').value;
    const size           = parseInt(document.getElementById('pp_mf_size').value);
    const fontColor      = document.getElementById('pp_mf_fontColor').value;
    const underlineStyle = document.getElementById('pp_mf_underlineStyle').value;
    const underlineColor = document.getElementById('pp_mf_underlineColor').value;
    const strikethrough       = document.getElementById('pp_mf_strikethrough').checked;
    const doubleStrikethrough = document.getElementById('pp_mf_doubleStrikethrough').checked;
    const superscript         = document.getElementById('pp_mf_superscript').checked;
    const subscript           = document.getElementById('pp_mf_subscript').checked;
    const smallCaps           = document.getElementById('pp_mf_smallCaps').checked;
    const allCaps             = document.getElementById('pp_mf_allCaps').checked;
    const hidden              = document.getElementById('pp_mf_hidden').checked;

    const scale       = document.getElementById('pp_mf_scale').value;
    const spacing     = document.getElementById('pp_mf_spacing').value;
    const spacingBy   = parseFloat(document.getElementById('pp_mf_spacingBy').value);
    const position    = document.getElementById('pp_mf_position').value;
    const positionBy  = parseFloat(document.getElementById('pp_mf_positionBy').value);
    const kerning     = document.getElementById('pp_mf_kerning').checked;
    const kerningPoints = parseFloat(document.getElementById('pp_mf_kerningPoints').value);
    const ligatures        = document.getElementById('pp_mf_ligatures').value;
    const numberSpacing    = document.getElementById('pp_mf_numberSpacing').value;
    const numberForms      = document.getElementById('pp_mf_numberForms').value;
    const stylisticSet     = document.getElementById('pp_mf_stylisticSet').value;
    const contextualAlternates = document.getElementById('pp_mf_contextualAlternates').checked;

    let errors=[];
    if(a.font           && font           !==a.font)           errors.push('Font→'+a.font);
    if(a.fontStyle      && fontStyle      !==a.fontStyle)      errors.push('Font style→'+a.fontStyle);
    if(a.size           !==undefined&&(isNaN(size)||size!==a.size)) errors.push('Size→'+a.size);
    if(a.fontColor      && fontColor      !==a.fontColor)      errors.push('Font color→'+a.fontColor);
    if(a.underlineStyle && underlineStyle !==a.underlineStyle) errors.push('Underline style→'+a.underlineStyle);
    if(a.underlineColor && underlineColor !==a.underlineColor) errors.push('Underline color→'+a.underlineColor);
    if(a.strikethrough       !==undefined&&strikethrough       !==a.strikethrough)       errors.push('Strikethrough→'+a.strikethrough);
    if(a.doubleStrikethrough !==undefined&&doubleStrikethrough !==a.doubleStrikethrough) errors.push('Double strikethrough→'+a.doubleStrikethrough);
    if(a.superscript         !==undefined&&superscript         !==a.superscript)         errors.push('Superscript→'+a.superscript);
    if(a.subscript           !==undefined&&subscript           !==a.subscript)           errors.push('Subscript→'+a.subscript);
    if(a.smallCaps           !==undefined&&smallCaps           !==a.smallCaps)           errors.push('Small caps→'+a.smallCaps);
    if(a.allCaps             !==undefined&&allCaps             !==a.allCaps)             errors.push('All caps→'+a.allCaps);
    if(a.hidden              !==undefined&&hidden              !==a.hidden)              errors.push('Hidden→'+a.hidden);

    if(a.scale     && scale     !==a.scale)     errors.push('Scale→'+a.scale);
    if(a.spacing   && spacing   !==a.spacing)   errors.push('Spacing→'+a.spacing);
    if(a.spacingBy !==undefined && a.spacing!=='Normal' && (isNaN(spacingBy)||spacingBy!==a.spacingBy)) errors.push('Spacing By→'+a.spacingBy);
    if(a.position  && position  !==a.position)  errors.push('Position→'+a.position);
    if(a.positionBy!==undefined && a.position!=='Normal' && (isNaN(positionBy)||positionBy!==a.positionBy)) errors.push('Position By→'+a.positionBy);
    if(a.kerning   !==undefined&&kerning !==a.kerning) errors.push('Kerning→'+a.kerning);
    if(a.kerningPoints!==undefined && a.kerning===true && (isNaN(kerningPoints)||kerningPoints!==a.kerningPoints))
        errors.push('Kerning points→'+a.kerningPoints);
    if(a.ligatures     && ligatures     !==a.ligatures)     errors.push('Ligatures→'+a.ligatures);
    if(a.numberSpacing && numberSpacing !==a.numberSpacing) errors.push('Number spacing→'+a.numberSpacing);
    if(a.numberForms   && numberForms   !==a.numberForms)   errors.push('Number forms→'+a.numberForms);
    if(a.stylisticSet  && stylisticSet  !==a.stylisticSet)  errors.push('Stylistic sets→'+a.stylisticSet);
    if(a.contextualAlternates!==undefined&&contextualAlternates!==a.contextualAlternates) errors.push('Contextual Alternates→'+a.contextualAlternates);

    if(errors.length){_showPopupError('pp_err_morefont','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   40. POPUP PROTECT DOCUMENT — Encrypt with Password / Restrict Editing
popupType: 'protect-document',
popupAnswer: {
  	action:   'restrict',
  	password: '2026',
  	limitFormatting:    true,
  	editingRestriction: 'Tracked changes',
 	 startEnforcing:     true,
  	enforcePassword:    '2026' }},
//  action:   'encrypt' | 'restrict'
   ============================================================
popupType: 'protect-document',
popupAnswer: {
  action:   'encrypt',              // 'encrypt' | 'restrict'
  password: 'Word2026!',            // chỉ chấm khi action:'encrypt'

  limitFormatting:    true,         // chỉ chấm khi action:'restrict'
  editingRestriction: 'Tracked changes',  // 'No changes (Read only)'|'Tracked changes'|'Comments'|'Filling in forms'
  startEnforcing:     true,         // true = phải bấm "Yes, Start Enforcing Protection" và xác nhận
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
function openProtectDocumentPopup(step){
    const box = _createPopupShell('Protect Document');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        action:             ans.action || 'encrypt',
        password:           ('password'           in ans) ? ans.password           : undefined,
        limitFormatting:    ('limitFormatting'    in ans) ? ans.limitFormatting    : undefined,
editingRestriction: ('editingRestriction' in ans) ? ans.editingRestriction : undefined,
        startEnforcing:     ('startEnforcing'     in ans) ? ans.startEnforcing     : undefined,
        enforcePassword:    ('enforcePassword'    in ans) ? ans.enforcePassword    : undefined,
    }; 
    window._ppPdEnforced = false;
    window._ppPdAction   = '';

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:380px;gap:0;padding:0;font-size:14px;';

    const menu = document.createElement('div');
    menu.style.cssText = 'padding:10px 14px;border-bottom:1px solid #e2e8f0;'
        +'background:#eff6ff;font-size:14px;color:#1e3a5f;';
    menu.innerHTML = '<b>🔒 Protect Document</b><br>'
        +'<span style="color:#64748b;">Control what types of changes people can make to this document.</span>';
    body.appendChild(menu);

    const optWrap = document.createElement('div');
    optWrap.style.cssText = 'display:flex;flex-direction:column;gap:2px;padding:8px 14px;';

    const optEncrypt = document.createElement('div');
    optEncrypt.id = 'pp_pd_opt_encrypt';
    optEncrypt.style.cssText = 'padding:8px 10px;cursor:pointer;border-radius:4px;border:1px solid transparent;';
    optEncrypt.innerHTML = '<b>🔑 Encrypt with Password</b><br><span style="font-size:14px;color:#64748b;">Require a password to open this document.</span>';
    optEncrypt.addEventListener('click', function(){ pp_pdSelectAction('encrypt'); });

    const optRestrict = document.createElement('div');
    optRestrict.id = 'pp_pd_opt_restrict';
    optRestrict.style.cssText = 'padding:8px 10px;cursor:pointer;border-radius:4px;border:1px solid transparent;';
    optRestrict.innerHTML = '<b>✏️ Restrict Editing</b><br><span style="font-size:14px;color:#64748b;">Control what types of changes people can make.</span>';
    optRestrict.addEventListener('click', function(){ pp_pdSelectAction('restrict'); });

    optWrap.appendChild(optEncrypt);
    optWrap.appendChild(optRestrict);
    body.appendChild(optWrap);

    /* ── PANEL: Encrypt with Password ── */
    const panelEncrypt = document.createElement('div');
    panelEncrypt.id = 'pp_pd_panel_encrypt';
    panelEncrypt.style.cssText = 'display:none;padding:12px 14px;border-top:1px solid #e2e8f0;';
    panelEncrypt.innerHTML = `
        <div style="font-size:14px;color:#64748b;margin-bottom:8px;">
            ⚠️ If you lose or forget the password, it cannot be recovered.
        </div>
        <label style="display:block;margin-bottom:3px;">Password:</label>
        <input type="password" id="pp_pd_password" placeholder="Nhập mật khẩu..."
            style="width:100%;padding:6px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;box-sizing:border-box;margin-bottom:8px;">
        <label style="display:block;margin-bottom:3px;">Reenter password:</label>
        <input type="password" id="pp_pd_password2" placeholder="Nhập lại mật khẩu..."
            style="width:100%;padding:6px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;box-sizing:border-box;">`;
    body.appendChild(panelEncrypt);

    /* ── PANEL: Restrict Editing (mô phỏng Task Pane bên phải) ── */
    const panelRestrict = document.createElement('div');
    panelRestrict.id = 'pp_pd_panel_restrict';
    panelRestrict.style.cssText = 'display:none;padding:12px 14px;border-top:1px solid #e2e8f0;'
        +'flex-direction:column;gap:10px;';
    panelRestrict.innerHTML = `
        <div class="pp-group-title" style="margin-top:0;">1. Formatting restrictions</div>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="pp_pd_limitFormatting">
            Limit formatting to a selection of styles
        </label>

        <div class="pp-group-title">2. Editing restrictions</div>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="pp_pd_allowOnly" onchange="pp_pdToggleEditingSelect()">
            Allow only this type of editing in the document:
        </label>
        <select id="pp_pd_editingRestriction" disabled class="pp-disabled" style="width:100%;">
            <option value="No changes (Read only)">No changes (Read only)</option>
            <option value="Tracked changes">Tracked changes</option>
            <option value="Comments">Comments</option>
            <option value="Filling in forms">Filling in forms</option>
        </select>

        <div class="pp-group-title">3. Start enforcement</div>
        <button type="button" class="pp-btn pp-btn-ok" style="align-self:flex-start;"
            onclick="pp_pdStartEnforcing()">Yes, Start Enforcing Protection</button>
        <div id="pp_pd_enforcePanel" style="display:none;background:#f8fafc;border:1px solid #cbd5e1;
            border-radius:4px;padding:8px;">
            <label style="display:block;margin-bottom:3px;font-size:14px;">Enter new password (optional):</label>
            <input type="password" id="pp_pd_enforcePassword" placeholder="(tuỳ chọn)"
                style="width:100%;padding:5px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;box-sizing:border-box;margin-bottom:6px;">
            <button type="button" class="pp-btn pp-btn-ok" onclick="pp_pdConfirmEnforce()">OK</button>
        </div>`;
    body.appendChild(panelRestrict);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_protect';
    errDiv.style.margin = '8px 14px 0';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkProtectDocumentPopup()">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button').forEach(function(el){ el.style.fontSize='14px'; });
    /* Không chọn sẵn mục nào — học sinh phải tự chọn đúng Encrypt/Restrict */
}
function pp_pdSelectAction(act){
    _hidePopupError('pp_err_protect');
    const a  = window._ppAns||{};
    const oE = document.getElementById('pp_pd_opt_encrypt');
    const oR = document.getElementById('pp_pd_opt_restrict');

    /* ── MỚI: click SAI mục ngay từ bước chọn -> báo lỗi tức thời, KHÔNG mở panel ──
       Người soạn có thể khai báo popupAnswer đủ field của cả 2 nhóm (Encrypt + Restrict),
       nhưng chỉ 1 action đúng — chọn nhầm mục còn lại luôn bị chặn ngay tại đây. */
    if(a.action && act!==a.action){
        const wrongEl = (act==='encrypt') ? oE : oR;
        wrongEl.style.background = 'rgba(220,38,38,0.08)';
        wrongEl.style.border     = '1px solid #dc2626';
        _showPopupError('pp_err_protect', '❌ Sai! Cần chọn mục: <b>'+(a.action==='encrypt'?'Encrypt with Password':'Restrict Editing')+'</b>');
        setTimeout(function(){
            wrongEl.style.background = '';
            wrongEl.style.border     = '1px solid transparent';
        }, 1200);
        return;
    }

    window._ppPdAction = act;
    [oE,oR].forEach(function(el){ el.style.background=''; el.style.border='1px solid transparent'; });
    if(act==='encrypt'){ oE.style.background='#dbeafe'; oE.style.border='1px solid #2563eb'; }
    else{ oR.style.background='#dbeafe'; oR.style.border='1px solid #2563eb'; }
    document.getElementById('pp_pd_panel_encrypt').style.display  = (act==='encrypt')  ? 'block':'none';
    document.getElementById('pp_pd_panel_restrict').style.display = (act==='restrict') ? 'flex' :'none';
}
function pp_pdToggleEditingSelect(){
    const chk = document.getElementById('pp_pd_allowOnly');
    const sel = document.getElementById('pp_pd_editingRestriction');
    if(!chk||!sel){return;}
    sel.disabled  = !chk.checked;
    sel.className = chk.checked ? '' : 'pp-disabled';
}
function pp_pdStartEnforcing(){
    const panel = document.getElementById('pp_pd_enforcePanel');
    if(panel){ panel.style.display='block'; }
}
function pp_pdConfirmEnforce(){
    window._ppPdEnforced = true;
    _hidePopupError('pp_err_protect');
    _showPopupError('pp_err_protect','✅ Đã bắt đầu bảo vệ tài liệu. Bấm "OK" để hoàn thành.');
    const el = document.getElementById('pp_err_protect');
    if(el){ el.style.color='#16a34a'; el.style.background='#ecfdf5'; el.style.borderColor='#86efac'; }
}
function checkProtectDocumentPopup(){
    _hidePopupError('pp_err_protect');
    const a = window._ppAns||{};
    const action = window._ppPdAction||'';

    if(a.action && action!==a.action){
        _showPopupError('pp_err_protect','❌ Sai! Cần chọn mục: <b>'+(a.action==='encrypt'?'Encrypt with Password':'Restrict Editing')+'</b>');
        return;
    }

    let errors=[];
    if(action==='encrypt'){
        const p1 = (document.getElementById('pp_pd_password')||{}).value||'';
        const p2 = (document.getElementById('pp_pd_password2')||{}).value||'';
        if(a.password!==undefined && p1!==a.password) errors.push('Password→"'+a.password+'"');
        if(p1!==p2) errors.push('Mật khẩu nhập lại chưa khớp');
} else if(action==='restrict'){
        const limitFmt = (document.getElementById('pp_pd_limitFormatting')||{}).checked||false;
        const allowOnly= (document.getElementById('pp_pd_allowOnly')||{}).checked||false;
        const restrictVal = (document.getElementById('pp_pd_editingRestriction')||{}).value||'';
        const enforcePw = (document.getElementById('pp_pd_enforcePassword')||{}).value||'';
        if(a.limitFormatting!==undefined && limitFmt!==a.limitFormatting) errors.push('Limit formatting→'+a.limitFormatting);
        if(a.editingRestriction && (!allowOnly || restrictVal!==a.editingRestriction)) errors.push('Editing restriction→'+a.editingRestriction);
        if(a.startEnforcing===true && window._ppPdEnforced!==true) errors.push('Cần bấm "Yes, Start Enforcing Protection" và xác nhận');
        if(a.enforcePassword!==undefined && enforcePw!==a.enforcePassword) errors.push('Enforce Password→"'+a.enforcePassword+'"');
    }

    if(errors.length){_showPopupError('pp_err_protect','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}


/* ============================================================
   41. POPUP CREATE NEW STYLE FROM FORMATTING — copy vào HTML
popupType: 'create-style',
popupAnswer: {
  styleName:      'Heading Custom',
  styleType:      'Paragraph',        
  styleBasedOn:   '(no style)',
  styleFollowing: 'Normal',

  font:           'Times New Roman',
  size:           13,
  bold:           true,
  italic:         false,
  underline:      false,
  fontColor:      'Automatic',       
  alignment:      'Left',             
  lineSpacing:    'Single',         
  lineSpacingBy:  1.5,               
  spaceBefore:    0,            
  spaceAfter:     0,                  
  indentLevel:    1,  
  addToGallery:      true,
  autoUpdate:        false,
  scopeOnlyDoc:      true,    
  scopeNewTemplate:  false,   } }, 
//2 cái cuối chọn 1      
   ============================================================
popupType: 'create-style',
popupAnswer: {
  styleName:      'Heading Custom',
  styleType:      'Paragraph',        // 'Paragraph'|'Character'|'Linked (Paragraph and Character)'|'Table'|'List'
  styleBasedOn:   '(no style)',
  styleFollowing: 'Normal',

  // ── Thanh Formatting ──
  font:           'Times New Roman',
  size:           13,
  bold:           true,
  italic:         false,
  underline:      false,
  fontColor:      'Automatic',        // 'Automatic'|'Black'|'Red'|'Blue' (gợi ý 2-3 màu — tự đổi tên khi câu hỏi yêu cầu màu khác)
  alignment:      'Left',             // 'Left'|'Center'|'Right'|'Justify'
  lineSpacing:    'Single',           // 'Single'|'1.5 lines'|'Double'|'At least'|'Exactly'|'Multiple'
  lineSpacingBy:  1.5,                // chỉ chấm khi lineSpacing thuộc 'At least'|'Exactly'|'Multiple'
  spaceBefore:    0,                  // pt
  spaceAfter:     0,                  // pt
  indentLevel:    1,                  // số lần Increase(+)/Decrease(-) Indent tính từ 0 (mặc định)

  // ── Khung dưới cùng ──
  addToGallery:      true,
  autoUpdate:        false,
  scopeOnlyDoc:      true,     // ⦿ Only in this document
  scopeNewTemplate:  false,    // ○ New documents based on this template
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
function openCreateStylePopup(step){
    const box = _createPopupShell('Create New Style from Formatting');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        styleName:      ('styleName'      in ans) ? ans.styleName      : undefined,
        styleType:      ('styleType'      in ans) ? ans.styleType      : undefined,
        styleBasedOn:   ('styleBasedOn'   in ans) ? ans.styleBasedOn   : undefined,
        styleFollowing: ('styleFollowing' in ans) ? ans.styleFollowing : undefined,

        font:           ('font'           in ans) ? ans.font           : undefined,
        size:           ('size'           in ans) ? ans.size           : undefined,
        bold:           ('bold'           in ans) ? ans.bold           : undefined,
        italic:         ('italic'         in ans) ? ans.italic         : undefined,
        underline:      ('underline'      in ans) ? ans.underline      : undefined,
        fontColor:      ('fontColor'      in ans) ? ans.fontColor      : undefined,
        alignment:      ('alignment'      in ans) ? ans.alignment      : undefined,
        lineSpacing:    ('lineSpacing'    in ans) ? ans.lineSpacing    : undefined,
        lineSpacingBy:  ('lineSpacingBy'  in ans) ? ans.lineSpacingBy  : undefined,
        spaceBefore:    ('spaceBefore'    in ans) ? ans.spaceBefore    : undefined,
        spaceAfter:     ('spaceAfter'     in ans) ? ans.spaceAfter     : undefined,
        indentLevel:    ('indentLevel'    in ans) ? ans.indentLevel    : undefined,

        addToGallery:   ('addToGallery'   in ans) ? ans.addToGallery   : undefined,
        autoUpdate:     ('autoUpdate'     in ans) ? ans.autoUpdate     : undefined,
        scope:          ans.scopeNewTemplate ? 'New documents based on this template'
                       : ans.scopeOnlyDoc    ? 'Only in this document'
                       : undefined,
    };

    window._ppCsBold      = false;
    window._ppCsItalic    = false;
    window._ppCsUnderline = false;
    window._ppCsAlign     = 'Left';
    window._ppCsIndent    = 0;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:460px;gap:8px;padding:12px 16px;';
    body.innerHTML = `
    <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center;">
        <label>Name:</label>
        <input type="text" id="pp_cs_name" placeholder="Nhập tên style...">

        <label>Style type:</label>
        <select id="pp_cs_type">
            <option value="Paragraph">Paragraph</option>
            <option value="Character">Character</option>
            <option value="Linked (Paragraph and Character)">Linked (Paragraph and Character)</option>
            <option value="Table">Table</option>
            <option value="List">List</option>
        </select>

        <label>Style based on:</label>
        <select id="pp_cs_basedOn">
            <option value="(no style)">(no style)</option>
            <option value="Normal">Normal</option>
            <option value="Heading 1">Heading 1</option>
            <option value="Heading 2">Heading 2</option>
        </select>

        <label>Style for following paragraph:</label>
        <select id="pp_cs_following">
            <option value="Normal">Normal</option>
            <option value="Same as new style created">Same as new style created</option>
        </select>
    </div>

    <div class="pp-group-title">Formatting</div>

    <!-- ── Dòng 1: Font | Size | B | I | U | Font Color ── -->
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
        <select id="pp_cs_font" style="flex:1.4;min-width:140px;">
            <option value="Calibri">Calibri</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Cambria">Cambria</option>
        </select>
        <input type="number" id="pp_cs_size" value="11" min="1" max="99" style="width:55px;">

<button type="button" id="pp_cs_bold" onclick="pp_csToggleFmt('bold')"
            title="Bold"
            style="width:30px;height:30px;font-weight:bold;color:#374151;border:1px solid #94a3b8;border-radius:3px;background:#fff;cursor:pointer;">B</button>
        <button type="button" id="pp_cs_italic" onclick="pp_csToggleFmt('italic')"
            title="Italic"
            style="width:30px;height:30px;font-style:italic;color:#374151;border:1px solid #94a3b8;border-radius:3px;background:#fff;cursor:pointer;">I</button>
        <button type="button" id="pp_cs_underline" onclick="pp_csToggleFmt('underline')"
            title="Underline"
            style="width:30px;height:30px;text-decoration:underline;color:#374151;border:1px solid #94a3b8;border-radius:3px;background:#fff;cursor:pointer;">U</button>

        <select id="pp_cs_fontColor" style="flex:1;min-width:110px;">
            <option value="Automatic">Automatic</option>
            <option value="Black">Black</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
        </select>
    </div>

    <!-- ── Dòng 2: Align x4 | Line Spacing | Before/After | Indent x2 ── -->
    <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">
<button type="button" id="pp_cs_alignLeft" onclick="pp_csSetAlign('Left')"
            title="Align Left"
            style="width:30px;height:30px;color:#374151;border:1px solid #94a3b8;border-radius:3px;background:#dbeafe;cursor:pointer;">≡</button>
        <button type="button" id="pp_cs_alignCenter" onclick="pp_csSetAlign('Center')"
            title="Center"
            style="width:30px;height:30px;color:#374151;border:1px solid #94a3b8;border-radius:3px;background:#fff;cursor:pointer;">≡</button>
        <button type="button" id="pp_cs_alignRight" onclick="pp_csSetAlign('Right')"
            title="Align Right"
            style="width:30px;height:30px;color:#374151;border:1px solid #94a3b8;border-radius:3px;background:#fff;cursor:pointer;">≡</button>
        <button type="button" id="pp_cs_alignJustify" onclick="pp_csSetAlign('Justify')"
            title="Justify"
            style="width:30px;height:30px;color:#374151;border:1px solid #94a3b8;border-radius:3px;background:#fff;cursor:pointer;">≡</button>
        <span style="width:1px;height:22px;background:#e2e8f0;margin:0 4px;"></span>

        <select id="pp_cs_lineSpacing" onchange="pp_csToggleSpacingBy()"
            title="Line Spacing" style="width:100px;">
            <option value="Single">Single</option>
            <option value="1.5 lines">1.5 lines</option>
            <option value="Double">Double</option>
            <option value="At least">At least</option>
            <option value="Exactly">Exactly</option>
            <option value="Multiple">Multiple</option>
        </select>
        <input type="number" id="pp_cs_lineSpacingBy" step="0.1" placeholder="0"
            disabled class="pp-disabled" style="width:50px;" title="Line spacing By">

        <span style="width:1px;height:22px;background:#e2e8f0;margin:0 4px;"></span>

        <label style="font-size:12px;color:#374151;white-space:nowrap;">Before:</label>
        <input type="number" id="pp_cs_spaceBefore" value="0" style="width:45px;" title="Space Before (pt)">
        <label style="font-size:12px;color:#374151;white-space:nowrap;">After:</label>
        <input type="number" id="pp_cs_spaceAfter" value="0" style="width:45px;" title="Space After (pt)">

        <span style="width:1px;height:22px;background:#e2e8f0;margin:0 4px;"></span>
<button type="button" onclick="pp_csIndentStep(-1)" title="Decrease Indent"
            style="width:30px;height:30px;color:#374151;border:1px solid #94a3b8;border-radius:3px;background:#fff;cursor:pointer;">⇤</button>
        <button type="button" onclick="pp_csIndentStep(1)" title="Increase Indent"
            style="width:30px;height:30px;color:#374151;border:1px solid #94a3b8;border-radius:3px;background:#fff;cursor:pointer;">⇥</button>
        <span id="pp_cs_indentLabel" style="font-size:12px;color:#64748b;margin-left:4px;">Indent: 0</span>
    </div>

    <div style="border:1px solid #cbd5e1;border-radius:4px;padding:10px;background:#fff;">
        <div id="pp_cs_preview" style="font-size:14px;">AaBbCcDdEeFfGg — Đây là mẫu xem trước kiểu chữ.</div>
    </div>

    <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;gap:20px;flex-wrap:wrap;">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                <input type="checkbox" id="pp_cs_addGallery">
                Add to the Styles gallery
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                <input type="checkbox" id="pp_cs_autoUpdate">
                Automatically update
            </label>
        </div>
        <div style="display:flex;gap:20px;flex-wrap:wrap;">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                <input type="radio" name="pp_cs_scope" value="Only in this document">
                Only in this document
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                <input type="radio" name="pp_cs_scope" value="New documents based on this template">
                New documents based on this template
            </label>
        </div>
    </div>

    <div class="pp-error" id="pp_err_createstyle"></div>
    <div class="pp-btn-row">
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkCreateStylePopup()">OK</button>
    </div>`;
    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button').forEach(function(el){ el.style.fontSize='14px'; });

    /* Giá trị hiển thị mặc định — CỐ ĐỊNH, không đọc từ ans (tránh lộ đáp án) */
    setTimeout(function(){
        document.getElementById('pp_cs_type').value      = 'Paragraph';
        document.getElementById('pp_cs_basedOn').value   = '(no style)';
        document.getElementById('pp_cs_following').value = 'Normal';
        document.getElementById('pp_cs_font').value      = 'Calibri';
        document.getElementById('pp_cs_size').value      = 11;
        document.getElementById('pp_cs_fontColor').value = 'Automatic';
        document.getElementById('pp_cs_lineSpacing').value = 'Single';
        document.getElementById('pp_cs_spaceBefore').value = 0;
        document.getElementById('pp_cs_spaceAfter').value  = 0;
document.querySelector('input[name="pp_cs_scope"][value="Only in this document"]').checked = true;
        document.getElementById('pp_cs_addGallery').checked = true;
        pp_csUpdatePreview();

        ['pp_cs_font','pp_cs_size','pp_cs_fontColor'].forEach(function(id){
            const el = document.getElementById(id);
            el.addEventListener('input', pp_csUpdatePreview);
            el.addEventListener('change', pp_csUpdatePreview);
        });
    }, 0);
}
function pp_csToggleFmt(type){
    if(type==='bold'){
        window._ppCsBold = !window._ppCsBold;
        document.getElementById('pp_cs_bold').style.background = window._ppCsBold ? '#dbeafe' : '#fff';
    } else if(type==='italic'){
        window._ppCsItalic = !window._ppCsItalic;
        document.getElementById('pp_cs_italic').style.background = window._ppCsItalic ? '#dbeafe' : '#fff';
    } else if(type==='underline'){
        window._ppCsUnderline = !window._ppCsUnderline;
        document.getElementById('pp_cs_underline').style.background = window._ppCsUnderline ? '#dbeafe' : '#fff';
    }
    pp_csUpdatePreview();
}
function pp_csSetAlign(al){
    window._ppCsAlign = al;
    ['Left','Center','Right','Justify'].forEach(function(a){
        const btn = document.getElementById('pp_cs_align'+a);
        if(btn){ btn.style.background = (a===al) ? '#dbeafe' : '#fff'; }
    });
    pp_csUpdatePreview();
}
function pp_csToggleSpacingBy(){
    const sel = document.getElementById('pp_cs_lineSpacing');
    const inp = document.getElementById('pp_cs_lineSpacingBy');
    if(!sel||!inp){return;}
    const on = ['At least','Exactly','Multiple'].indexOf(sel.value) !== -1;
    inp.disabled  = !on;
    inp.className = on ? '' : 'pp-disabled';
    if(!on){ inp.value=''; }
}
function pp_csIndentStep(delta){
    window._ppCsIndent = Math.max(0, window._ppCsIndent + delta);
    const lbl = document.getElementById('pp_cs_indentLabel');
    if(lbl){ lbl.textContent = 'Indent: '+window._ppCsIndent; }
}
function pp_csUpdatePreview(){
    const el = document.getElementById('pp_cs_preview');
    if(!el){return;}
    const font  = document.getElementById('pp_cs_font').value;
    const size  = parseInt(document.getElementById('pp_cs_size').value)||11;
    const color = document.getElementById('pp_cs_fontColor').value;
    const colorMap = { 'Automatic':'#111827', 'Black':'#000000', 'Red':'#dc2626', 'Blue':'#2563eb' };
    el.style.fontFamily = font;
    el.style.fontSize   = Math.min(size,24)+'px';
    el.style.fontWeight = window._ppCsBold      ? 'bold'      : 'normal';
    el.style.fontStyle  = window._ppCsItalic    ? 'italic'    : 'normal';
    el.style.textDecoration = window._ppCsUnderline ? 'underline' : 'none';
    el.style.textAlign  = window._ppCsAlign.toLowerCase();
    el.style.color      = colorMap[color] || '#111827';
}
function checkCreateStylePopup(){
    _hidePopupError('pp_err_createstyle');
    const a = window._ppAns||{};

    const name      = (document.getElementById('pp_cs_name')||{}).value||'';
    const type      = document.getElementById('pp_cs_type').value;
    const basedOn   = document.getElementById('pp_cs_basedOn').value;
    const following = document.getElementById('pp_cs_following').value;

    const font      = document.getElementById('pp_cs_font').value;
    const size      = parseInt(document.getElementById('pp_cs_size').value);
    const bold      = window._ppCsBold;
    const italic    = window._ppCsItalic;
    const underline = window._ppCsUnderline;
    const fontColor = document.getElementById('pp_cs_fontColor').value;
    const align     = window._ppCsAlign;

    const lineSpacing = document.getElementById('pp_cs_lineSpacing').value;
    const lsByEl      = document.getElementById('pp_cs_lineSpacingBy');
    const lineSpacingBy = (lsByEl && !lsByEl.disabled && lsByEl.value!=='') ? parseFloat(lsByEl.value) : undefined;
    const spaceBefore = parseFloat(document.getElementById('pp_cs_spaceBefore').value);
    const spaceAfter  = parseFloat(document.getElementById('pp_cs_spaceAfter').value);
    const indentLevel = window._ppCsIndent;

    const gallery   = (document.getElementById('pp_cs_addGallery')||{}).checked||false;
    const autoUpd   = (document.getElementById('pp_cs_autoUpdate')||{}).checked||false;
    const scopeEl   = document.querySelector('input[name="pp_cs_scope"]:checked');
    const scope     = scopeEl ? scopeEl.value : '';

    let errors=[];
    if(a.styleName      !==undefined && name.trim()!==a.styleName)   errors.push('Name→"'+a.styleName+'"');
    if(a.styleType      && type      !==a.styleType)                errors.push('Style type→'+a.styleType);
    if(a.styleBasedOn   && basedOn   !==a.styleBasedOn)              errors.push('Style based on→'+a.styleBasedOn);
    if(a.styleFollowing && following!==a.styleFollowing)            errors.push('Style for following→'+a.styleFollowing);

    if(a.font           && font      !==a.font)                     errors.push('Font→'+a.font);
    if(a.size!==undefined&&(isNaN(size)||size!==a.size))            errors.push('Size→'+a.size);
    if(a.bold           !==undefined && bold     !==a.bold)         errors.push('Bold→'+a.bold);
    if(a.italic         !==undefined && italic   !==a.italic)       errors.push('Italic→'+a.italic);
    if(a.underline      !==undefined && underline!==a.underline)    errors.push('Underline→'+a.underline);
    if(a.fontColor      && fontColor !==a.fontColor)                errors.push('Font Color→'+a.fontColor);
    if(a.alignment      && align     !==a.alignment)                errors.push('Alignment→'+a.alignment);

    if(a.lineSpacing    && lineSpacing!==a.lineSpacing)             errors.push('Line spacing→'+a.lineSpacing);
    if(a.lineSpacingBy!==undefined && ['At least','Exactly','Multiple'].indexOf(a.lineSpacing)!==-1){
        if(lineSpacingBy===undefined||isNaN(lineSpacingBy)||lineSpacingBy!==a.lineSpacingBy)
            errors.push('Line spacing By→'+a.lineSpacingBy);
    }
    if(a.spaceBefore!==undefined&&(isNaN(spaceBefore)||spaceBefore!==a.spaceBefore)) errors.push('Space Before→'+a.spaceBefore+'pt');
    if(a.spaceAfter !==undefined&&(isNaN(spaceAfter) ||spaceAfter !==a.spaceAfter))  errors.push('Space After→'+a.spaceAfter+'pt');
    if(a.indentLevel!==undefined && indentLevel!==a.indentLevel)   errors.push('Indent level→'+a.indentLevel);

    if(a.addToGallery   !==undefined && gallery!==a.addToGallery)    errors.push('Add to Gallery→'+a.addToGallery);
    if(a.autoUpdate      !==undefined && autoUpd!==a.autoUpdate)       errors.push('Automatically update→'+a.autoUpdate);
    if(a.scope           && scope    !==a.scope)                       errors.push('Scope→'+a.scope);

    if(errors.length){_showPopupError('pp_err_createstyle','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   42. POPUP INSERT OBJECT — copy vào HTML
popupType: 'insert-object',
popupAnswer: {
  	activeTab: 'createFromFile',       
  	objectType: 'Microsoft Excel Worksheet',   
  	browseFiles: [
    		{ name:'budget.xlsx',  folder:'Misc' },
    		{ name:'report.docx',  folder:'Misc' },
    		{ name:'summary.pdf',  folder:'Documents' },
    		{ name:'invoice.xlsx', folder:'Documents' },
		{ name:'summary.pdf',  folder:'C:\\' },
    		{ name:'invoice.xlsx', folder:'C:\\'},
  		],
  	correctFile:   'budget.xlsx', 
  	correctFolder: 'Misc',         
  	linkToFile:    false,
  	displayAsIcon: false  }},
//sửa đường dẫn trong browseFiles, đáp án correct phải trùng với Name và Folder, không cần sửa code
   ============================================================
popupType: 'insert-object',
popupAnswer: {
  activeTab: 'createFromFile',        // 'createNew' | 'createFromFile'
  objectType: 'Microsoft Excel Worksheet',   // chỉ chấm khi activeTab:'createNew'

  // ── Chỉ chấm khi activeTab:'createFromFile' — mô phỏng Browse thật, KHÔNG gõ tay đường dẫn ──
  browseFiles: [
    { name:'budget.xlsx',  folder:'Misc' },
    { name:'report.docx',  folder:'Misc' },
    { name:'summary.pdf',  folder:'Documents' },
    { name:'invoice.xlsx', folder:'Documents' },
  ],
  correctFile:   'budget.xlsx',   // tên file đúng cần chọn
  correctFolder: 'Misc',          // thư mục chứa file đúng — chỉ khai báo nếu câu hỏi yêu cầu đúng cả thư mục

  linkToFile:    false,
  displayAsIcon: false,
}},
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
function openInsertObjectPopup(step){
    const box = _createPopupShell('Object');
    const ans = step.popupAnswer || {};

    const browseFiles = ans.browseFiles || [
        { name:'document1.docx', folder:'Documents' },
        { name:'document2.docx', folder:'Documents' },
    ];

    window._ppAns = {
        activeTab:     ans.activeTab || 'createNew',
        objectType:    ('objectType'    in ans) ? ans.objectType    : undefined,
        correctFile:   ('correctFile'   in ans) ? ans.correctFile   : undefined,
        correctFolder: ('correctFolder' in ans) ? ans.correctFolder : undefined,
        linkToFile:    ('linkToFile'    in ans) ? ans.linkToFile    : undefined,
        displayAsIcon: ('displayAsIcon' in ans) ? ans.displayAsIcon : undefined,
    };
    window._ppIoBrowseFiles   = browseFiles;
    window._ppIoSelectedFile  = null;
    window._ppIoSelectedFolder= null;
    window._ppIoActiveFolder  = null;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:420px;gap:0;padding:0;font-size:14px;';

    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;border-bottom:2px solid #94a3b8;padding:0 10px;background:#f1f5f9;';
    const tabEls = {};
    [['createNew','Create New'],['createFromFile','Create from File']].forEach(function(t){
        const td = document.createElement('div');
        td.textContent = t[1];
        td.style.cssText = 'padding:7px 14px;cursor:pointer;font-size:14px;border:1px solid transparent;'
            +'border-bottom:none;margin-bottom:-2px;border-radius:3px 3px 0 0;color:#374151;';
        td.addEventListener('click', function(){ pp_ioSetTab(t[0]); });
        tabBar.appendChild(td);
        tabEls[t[0]] = td;
    });
    body.appendChild(tabBar);
    window._ppIoTabEls = tabEls;

    const content = document.createElement('div');
    content.style.cssText = 'padding:12px 14px;';
    body.appendChild(content);

    const panelNew = document.createElement('div');
    panelNew.id = 'pp_io_panel_createNew';
    panelNew.innerHTML = `
        <label style="display:block;margin-bottom:4px;">Object type:</label>
        <select id="pp_io_objectType" size="6" style="width:100%;font-size:14px;">
            <option>Microsoft Excel Worksheet</option>
            <option>Microsoft Excel Chart</option>
            <option>Microsoft PowerPoint Presentation</option>
            <option>Microsoft Word Document</option>
            <option>Bitmap Image</option>
            <option>Microsoft Equation 3.0</option>
        </select>
        <div style="margin-top:8px;">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                <input type="checkbox" id="pp_io_displayIconNew"> Display as icon
            </label>
        </div>`;
    content.appendChild(panelNew);

    /* ══ PANEL: Create from File — mô phỏng Browse thật ══ */
    const panelFile = document.createElement('div');
    panelFile.id = 'pp_io_panel_createFromFile';
    panelFile.style.display = 'none';
    panelFile.style.position = 'relative';
    panelFile.innerHTML = `
        <label style="display:block;margin-bottom:4px;">File name:</label>
        <div style="display:flex;gap:6px;">
            <input type="text" id="pp_io_fileName" readonly placeholder="Chưa chọn file — bấm Browse..."
                style="flex:1;background:#f8fafc;color:#374151;">
            <button type="button" class="pp-btn" style="padding:4px 12px;" onclick="pp_ioToggleBrowse()">Browse...</button>
        </div>
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                <input type="checkbox" id="pp_io_linkToFile"> Link to file
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                <input type="checkbox" id="pp_io_displayIconFile"> Display as icon
            </label>
        </div>

        <!-- Khung Browse nổi -->
        <div id="pp_io_browsePanel" style="display:none;position:absolute;top:36px;left:0;right:0;
            background:#fff;border:1px solid #94a3b8;border-radius:4px;box-shadow:0 6px 18px rgba(0,0,0,0.18);
            z-index:30;">
            <div id="pp_io_folderTabs" style="display:flex;gap:2px;padding:6px 8px;border-bottom:1px solid #e2e8f0;
                background:#f8fafc;flex-wrap:wrap;"></div>
            <div id="pp_io_fileList" style="max-height:160px;overflow-y:auto;padding:4px;"></div>
        </div>`;
    content.appendChild(panelFile);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_insertobject';
    errDiv.style.margin = '0 14px 8px';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkInsertObjectPopup()">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button').forEach(function(el){ el.style.fontSize='14px'; });

setTimeout(function(){ pp_ioSetTab(window._ppAns.activeTab || 'createNew'); }, 0);
}
function pp_ioSetTab(tab){
    const tabEls = window._ppIoTabEls||{};
    ['createNew','createFromFile'].forEach(function(t){
        const el = tabEls[t]; if(!el){return;}
        if(t===tab){ el.style.background='#fff'; el.style.border='1px solid #94a3b8'; el.style.borderBottom='2px solid #fff'; el.style.fontWeight='bold'; el.style.color='#1e3a5f'; }
        else{ el.style.background=''; el.style.border='1px solid transparent'; el.style.fontWeight='normal'; el.style.color='#374151'; }
    });
    document.getElementById('pp_io_panel_createNew').style.display      = (tab==='createNew')?'block':'none';
    document.getElementById('pp_io_panel_createFromFile').style.display = (tab==='createFromFile')?'block':'none';
    window._ppIoActiveTab = tab;
    _hidePopupError('pp_err_insertobject');
}

/* ── Mở/đóng khung Browse, dựng danh sách thư mục + file ── */
function pp_ioToggleBrowse(){
    const panel = document.getElementById('pp_io_browsePanel');
    if(!panel){return;}
    const isOpen = panel.style.display === 'block';
    if(isOpen){ panel.style.display='none'; return; }

    const files = window._ppIoBrowseFiles||[];
    const folders = [];
    files.forEach(function(f){ if(folders.indexOf(f.folder)===-1){ folders.push(f.folder); } });

    if(!window._ppIoActiveFolder){ window._ppIoActiveFolder = folders[0]; }

    const tabsEl = document.getElementById('pp_io_folderTabs');
    tabsEl.innerHTML = '';
    folders.forEach(function(fd){
        const tb = document.createElement('div');
        tb.textContent = '📁 '+fd;
        tb.dataset.folder = fd;
        tb.style.cssText = 'padding:5px 10px;cursor:pointer;font-size:14px;border-radius:3px;color:#374151;'
            +(fd===window._ppIoActiveFolder ? 'background:#dbeafe;font-weight:bold;color:#1d4ed8;' : '');
        tb.addEventListener('click', function(){
            window._ppIoActiveFolder = fd;
            pp_ioRenderFileList();
            Array.from(tabsEl.children).forEach(function(el){
                const on = el.dataset.folder===fd;
                el.style.background = on ? '#dbeafe' : '';
                el.style.fontWeight  = on ? 'bold' : 'normal';
                el.style.color       = on ? '#1d4ed8' : '#374151';
            });
        });
        tabsEl.appendChild(tb);
    });

    pp_ioRenderFileList();
    panel.style.display = 'block';
}
function pp_ioRenderFileList(){
    const listEl = document.getElementById('pp_io_fileList');
    if(!listEl){return;}
    const files = (window._ppIoBrowseFiles||[]).filter(function(f){ return f.folder===window._ppIoActiveFolder; });
    listEl.innerHTML = '';
    if(files.length===0){
        listEl.innerHTML = '<div style="padding:10px;color:#94a3b8;font-size:14px;text-align:center;">— Thư mục trống —</div>';
        return;
    }
    files.forEach(function(f){
        const row = document.createElement('div');
        row.textContent = '📄 '+f.name;
        row.style.cssText = 'padding:6px 10px;cursor:pointer;font-size:14px;color:#374151;border-radius:3px;';
        row.addEventListener('mouseenter', function(){ row.style.background='#eff6ff'; });
        row.addEventListener('mouseleave', function(){ row.style.background=''; });
        row.addEventListener('click', function(){ pp_ioSelectFile(f.name, f.folder); });
        listEl.appendChild(row);
    });
}
function pp_ioSelectFile(name, folder){
    window._ppIoSelectedFile   = name;
    window._ppIoSelectedFolder = folder;
    const input = document.getElementById('pp_io_fileName');
    if(input){ input.value = name; }
    const panel = document.getElementById('pp_io_browsePanel');
    if(panel){ panel.style.display='none'; }
    _hidePopupError('pp_err_insertobject');
}

function checkInsertObjectPopup(){
    _hidePopupError('pp_err_insertobject');
    const a = window._ppAns||{};
    const tab = window._ppIoActiveTab||'createNew';
    let errors=[];
    if(a.activeTab && tab!==a.activeTab){
        _showPopupError('pp_err_insertobject','❌ Chưa đúng! Tab→'+(a.activeTab==='createNew'?'Create New':'Create from File'));
        return;
    }
    if(tab==='createNew'){
        const objType = document.getElementById('pp_io_objectType').value;
        const icon    = (document.getElementById('pp_io_displayIconNew')||{}).checked||false;
        if(a.objectType && objType!==a.objectType) errors.push('Object type→'+a.objectType);
        if(a.displayAsIcon!==undefined && icon!==a.displayAsIcon) errors.push('Display as icon→'+a.displayAsIcon);
    } else {
        const link  = (document.getElementById('pp_io_linkToFile')||{}).checked||false;
        const icon  = (document.getElementById('pp_io_displayIconFile')||{}).checked||false;

        if(!window._ppIoSelectedFile){
            _showPopupError('pp_err_insertobject','⚠️ Hãy bấm "Browse..." và chọn file trước.');
            return;
        }
        if(a.correctFile   && window._ppIoSelectedFile  !==a.correctFile)   errors.push('File→"'+a.correctFile+'"');
        if(a.correctFolder && window._ppIoSelectedFolder!==a.correctFolder) errors.push('Thư mục→"'+a.correctFolder+'"');
        if(a.linkToFile!==undefined && link!==a.linkToFile) errors.push('Link to file→'+a.linkToFile);
        if(a.displayAsIcon!==undefined && icon!==a.displayAsIcon) errors.push('Display as icon→'+a.displayAsIcon);
    }
    if(errors.length){_showPopupError('pp_err_insertobject','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   43. POPUP INSERT CHART — //copy HTML
popupType: 'insert-chart',
popupAnswer: {
  	category: 'Column', 
  	subtype:  'Clustered Column'  }},
   ============================================================
popupType: 'insert-chart',
popupAnswer: {
  category: 'Column',        // 'Column'|'Line'|'Pie'|'Bar'|'Area'|'X Y (Scatter)'|'Combo'
  subtype:  'Clustered Column',
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
var _CHART_SUBTYPES = {
    'Column':  ['Clustered Column','Stacked Column','100% Stacked Column'],
    'Line':    ['Line','Stacked Line','Line with Markers'],
    'Pie':     ['Pie','Doughnut'],
    'Bar':     ['Clustered Bar','Stacked Bar','100% Stacked Bar'],
    'Area':    ['Area','Stacked Area'],
    'X Y (Scatter)': ['Scatter','Scatter with Smooth Lines'],
    'Combo':   ['Clustered Column - Line','Custom Combination'],
};
function openInsertChartPopup(step){
    const box = _createPopupShell('Insert Chart');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        category: ('category' in ans) ? ans.category : undefined,
        subtype:  ('subtype'  in ans) ? ans.subtype  : undefined,
    };
    window._ppChartCategory = null;
    window._ppChartSubtype  = null;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:460px;gap:0;padding:0;font-size:14px;';

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:150px 1fr;min-height:260px;';

    const catList = document.createElement('div');
    catList.style.cssText = 'border-right:1px solid #e2e8f0;padding:6px 0;overflow-y:auto;';
    Object.keys(_CHART_SUBTYPES).forEach(function(cat){
        const row = document.createElement('div');
        row.id = 'pp_ic_cat_'+cat.replace(/[^a-zA-Z]/g,'');
        row.textContent = cat;
        row.style.cssText = 'padding:8px 12px;cursor:pointer;font-size:14px;color:#374151;';
        row.addEventListener('click', function(){ pp_icSelectCategory(cat); });
        row.addEventListener('mouseenter', function(){ if(window._ppChartCategory!==cat) row.style.background='#eff6ff'; });
        row.addEventListener('mouseleave', function(){ if(window._ppChartCategory!==cat) row.style.background=''; });
        catList.appendChild(row);
    });
    grid.appendChild(catList);

    const subWrap = document.createElement('div');
    subWrap.id = 'pp_ic_subWrap';
    subWrap.style.cssText = 'padding:12px 14px;display:flex;flex-direction:column;gap:8px;';
    subWrap.innerHTML = '<div style="color:#94a3b8;font-size:14px;text-align:center;margin-top:60px;">👈 Chọn 1 loại biểu đồ bên trái</div>';
    grid.appendChild(subWrap);

    body.appendChild(grid);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_insertchart';
    errDiv.style.margin = '8px 14px 0';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkInsertChartPopup()">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button').forEach(function(el){ el.style.fontSize='14px'; });
}
function pp_icSelectCategory(cat){
    _hidePopupError('pp_err_insertchart');
    window._ppChartCategory = cat;
    window._ppChartSubtype = null;
    Object.keys(_CHART_SUBTYPES).forEach(function(c){
        const el = document.getElementById('pp_ic_cat_'+c.replace(/[^a-zA-Z]/g,''));
        if(el){ el.style.background = (c===cat) ? '#dbeafe' : ''; el.style.fontWeight = (c===cat) ? 'bold' : 'normal'; }
    });
    const subWrap = document.getElementById('pp_ic_subWrap');
    subWrap.innerHTML = '';
    const label = document.createElement('div');
    label.style.cssText = 'font-size:14px;font-weight:bold;color:#1e3a5f;';
    label.textContent = cat;
    subWrap.appendChild(label);
    const subGrid = document.createElement('div');
    subGrid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px;';

_CHART_SUBTYPES[cat].forEach(function(sub){
        const item = document.createElement('div');
        item.dataset.sub = sub;
        item.style.cssText = 'border:2px solid #e2e8f0;border-radius:4px;padding:10px 6px;text-align:center;'
            +'cursor:pointer;font-size:14px;color:#374151;background:#f8fafc;';
        item.textContent = sub;
        item.addEventListener('click', function(){ pp_icSelectSubtype(sub); });
        subGrid.appendChild(item);
    });
    subWrap.appendChild(subGrid);
}

function pp_icSelectSubtype(sub){
    window._ppChartSubtype = sub;
    document.querySelectorAll('#pp_ic_subWrap [data-sub]').forEach(function(el){
        if(el.dataset.sub===sub){ el.style.border='2px solid #2563eb'; el.style.background='#dbeafe'; }
        else{ el.style.border='2px solid #e2e8f0'; el.style.background='#f8fafc'; }
    });
}
function checkInsertChartPopup(){
    _hidePopupError('pp_err_insertchart');
    const a = window._ppAns||{};
    if(!window._ppChartCategory){ _showPopupError('pp_err_insertchart','⚠️ Hãy chọn loại biểu đồ trước.'); return; }
    let errors=[];
    if(a.category && window._ppChartCategory!==a.category) errors.push('Category→'+a.category);
    if(a.subtype  && window._ppChartSubtype !==a.subtype)  errors.push('Subtype→'+a.subtype);
    if(errors.length){_showPopupError('pp_err_insertchart','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}


/* ============================================================
   44. POPUP MARK INDEX ENTRY + INSERT INDEX — //nhóm Index
popupType: 'insert-index',
popupAnswer: {
  	activeTab: 'markEntry',             
  	mainEntry:             'Microsoft Word',
  	subentry:              '',
  	optionCrossReference:  false,
  	optionCurrentPage:     true,
  	optionPageRange:       false,
  	boldPageNumber:        false,
  	italicPageNumber:      false,
  	markAll:               false, }},      

popupType: 'insert-index',
popupAnswer: {
  	activeTab: 'insertIndex',      	
	indexType:             'Indented',   
  	columns:                2,
  	rightAlignPageNumbers:  true,
  	tabLeader:              'dots',     
  	formats:                'From template' }},

  activeTab: 'markEntry',  // 'markEntry' | 'insertIndex'
   ============================================================
popupType: 'insert-index',
popupAnswer: {
  activeTab: 'markEntry',              // 'markEntry' | 'insertIndex'

  // Tab Mark Index Entry
  mainEntry:             'Microsoft Word',
  subentry:              '',
  optionCrossReference:  false,
  optionCurrentPage:     true,
  optionPageRange:       false,
  boldPageNumber:        false,
  italicPageNumber:      false,
  markAll:               false,        // true = phải bấm "Mark All" thay vì "Mark"

  // Tab Index (Insert Index)
  indexType:             'Indented',   // 'Indented'|'Run-in'
  columns:                2,
  rightAlignPageNumbers:  true,
  tabLeader:              'dots',       // 'none'|'dots'|'dash'|'underline'
  formats:                'From template',
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
function openInsertIndexPopup(step){
    const box = _createPopupShell('Index');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        activeTab:            ans.activeTab || 'markEntry',
        mainEntry:            ('mainEntry'            in ans) ? ans.mainEntry            : undefined,
        subentry:             ('subentry'             in ans) ? ans.subentry             : undefined,
        optionCrossReference: ('optionCrossReference' in ans) ? ans.optionCrossReference  : undefined,
        optionCurrentPage:    ('optionCurrentPage'    in ans) ? ans.optionCurrentPage     : undefined,
        optionPageRange:      ('optionPageRange'      in ans) ? ans.optionPageRange       : undefined,
        boldPageNumber:       ('boldPageNumber'       in ans) ? ans.boldPageNumber        : undefined,
        italicPageNumber:     ('italicPageNumber'     in ans) ? ans.italicPageNumber      : undefined,
        markAll:              ('markAll'              in ans) ? ans.markAll              : undefined,
        indexType:            ('indexType'            in ans) ? ans.indexType            : undefined,
        columns:              ('columns'              in ans) ? ans.columns              : undefined,
        rightAlignPageNumbers:('rightAlignPageNumbers'in ans) ? ans.rightAlignPageNumbers : undefined,
        tabLeader:            ('tabLeader'            in ans) ? ans.tabLeader            : undefined,
        formats:              ('formats'              in ans) ? ans.formats              : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:420px;gap:0;padding:0;font-size:14px;';

    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;border-bottom:2px solid #94a3b8;padding:0 10px;background:#f1f5f9;';
    const tabEls = {};
    [['markEntry','Mark Index Entry'],['insertIndex','Index']].forEach(function(t){
        const td = document.createElement('div');
        td.textContent = t[1];
        td.style.cssText = 'padding:7px 14px;cursor:pointer;font-size:14px;border:1px solid transparent;'
            +'border-bottom:none;margin-bottom:-2px;border-radius:3px 3px 0 0;color:#374151;';
        td.addEventListener('click', function(){ pp_idxSetTab(t[0]); });
        tabBar.appendChild(td);
        tabEls[t[0]] = td;
    });
    body.appendChild(tabBar);
    window._ppIdxTabEls = tabEls;

    const content = document.createElement('div');
    content.style.cssText = 'padding:12px 14px;';
    body.appendChild(content);

    /* ══ PANEL: Mark Index Entry ══ */
    const panelMark = document.createElement('div');
    panelMark.id = 'pp_idx_panel_markEntry';
    panelMark.innerHTML = `
        <label style="display:block;margin-bottom:3px;">Main entry:</label>
        <input type="text" id="pp_idx_mainEntry" placeholder="Nhập mục chính..." style="width:100%;margin-bottom:8px;">
        <label style="display:block;margin-bottom:3px;">Subentry:</label>
        <input type="text" id="pp_idx_subentry" placeholder="(tuỳ chọn)" style="width:100%;margin-bottom:8px;">

        <div class="pp-group-title">Options</div>
        <div class="pp-radio-group" style="margin-bottom:8px;">
            <label><input type="radio" name="pp_idx_opt" value="cross"> Cross-reference:</label>
            <label><input type="radio" name="pp_idx_opt" value="current" checked> Current page</label>
            <label><input type="radio" name="pp_idx_opt" value="range"> Page range</label>
        </div>

        <div class="pp-group-title">Page number format</div>
        <div style="display:flex;gap:14px;">
            <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="pp_idx_bold"> Bold</label>
            <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="pp_idx_italic"> Italic</label>
        </div>

        <div style="display:flex;gap:8px;margin-top:10px;">
            <button type="button" class="pp-btn pp-btn-ok" onclick="pp_idxMark(false)">Mark</button>
            <button type="button" class="pp-btn pp-btn-ok" onclick="pp_idxMark(true)">Mark All</button>
        </div>`;
    content.appendChild(panelMark);

    /* ══ PANEL: Index (Insert Index) ══ */
    const panelIdx = document.createElement('div');
    panelIdx.id = 'pp_idx_panel_insertIndex';
    panelIdx.style.display = 'none';
    panelIdx.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
                <div class="pp-group-title" style="margin-top:0;">Print Preview</div>
                <div style="border:1px solid #94a3b8;border-radius:3px;background:#fff;padding:8px;font-size:14px;min-height:80px;">
                    <b>Aristotle</b>, 2<br>
                    <b>Asian art</b>, 4-5<br>
                    &nbsp;&nbsp;calligraphy, 7<br>
                    <b>Asia Pacific market</b>, 9-10
                </div>
            </div>
            <div>
                <div class="pp-group-title" style="margin-top:0;">Type</div>
                <label style="display:flex;align-items:center;gap:6px;"><input type="radio" name="pp_idx_type" value="Indented" checked> Indented</label>
                <label style="display:flex;align-items:center;gap:6px;"><input type="radio" name="pp_idx_type" value="Run-in"> Run-in</label>

                <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;margin-top:8px;">
                    <label>Columns:</label>
                    <input type="number" id="pp_idx_columns" min="1" max="4" value="2" style="width:60px;">
                    <label>Formats:</label>
                    <select id="pp_idx_formats">
                        <option value="From template">From template</option>
                        <option value="Classic">Classic</option>
                        <option value="Fancy">Fancy</option>
                        <option value="Modern">Modern</option>
                        <option value="Bulleted">Bulleted</option>
                        <option value="Formal">Formal</option>
                        <option value="Simple">Simple</option>
                    </select>
                    <label>Tab leader:</label>
                    <select id="pp_idx_tabLeader">
                        <option value="none">(none)</option>
                        <option value="dots">.............. (Dots)</option>
                        <option value="dash">– – – – – (Hyphen)</option>
                        <option value="underline">_ _ _ _ _ (Underline)</option>
                    </select>
                </div>
                <label style="display:flex;align-items:center;gap:6px;margin-top:8px;">
                    <input type="checkbox" id="pp_idx_rightAlign"> Right align page numbers
                </label>
            </div>
        </div>`;
    content.appendChild(panelIdx);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_insertindex';
    errDiv.style.margin = '0 14px 8px';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Close</button>
        <button class="pp-btn pp-btn-ok" onclick="checkInsertIndexPopup()">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button').forEach(function(el){ el.style.fontSize='14px'; });

    setTimeout(function(){ pp_idxSetTab('markEntry'); }, 0);
}
function pp_idxSetTab(tab){
    const tabEls = window._ppIdxTabEls||{};
    ['markEntry','insertIndex'].forEach(function(t){
        const el = tabEls[t]; if(!el){return;}
        if(t===tab){ el.style.background='#fff'; el.style.border='1px solid #94a3b8'; el.style.borderBottom='2px solid #fff'; el.style.fontWeight='bold'; el.style.color='#1e3a5f'; }
        else{ el.style.background=''; el.style.border='1px solid transparent'; el.style.fontWeight='normal'; el.style.color='#374151'; }
    });
    document.getElementById('pp_idx_panel_markEntry').style.display   = (tab==='markEntry')?'block':'none';
    document.getElementById('pp_idx_panel_insertIndex').style.display = (tab==='insertIndex')?'block':'none';
    window._ppIdxActiveTab = tab;
    _hidePopupError('pp_err_insertindex');
}
function pp_idxMark(all){
    _hidePopupError('pp_err_insertindex');
    const a = window._ppAns||{};
    const mainEntry = (document.getElementById('pp_idx_mainEntry')||{}).value||'';
    const subentry  = (document.getElementById('pp_idx_subentry')||{}).value||'';
    const optEl = document.querySelector('input[name="pp_idx_opt"]:checked');
    const opt = optEl ? optEl.value : '';
    const bold = (document.getElementById('pp_idx_bold')||{}).checked||false;
    const italic = (document.getElementById('pp_idx_italic')||{}).checked||false;

    let errors=[];
    if(a.mainEntry!==undefined && mainEntry.trim()!==a.mainEntry) errors.push('Main entry→"'+a.mainEntry+'"');
    if(a.subentry !==undefined && subentry.trim() !==a.subentry)  errors.push('Subentry→"'+a.subentry+'"');
    if(a.optionCrossReference!==undefined && (opt==='cross') !==a.optionCrossReference) errors.push('Cross-reference→'+a.optionCrossReference);
    if(a.optionCurrentPage   !==undefined && (opt==='current')!==a.optionCurrentPage)   errors.push('Current page→'+a.optionCurrentPage);
    if(a.optionPageRange     !==undefined && (opt==='range')  !==a.optionPageRange)     errors.push('Page range→'+a.optionPageRange);
    if(a.boldPageNumber  !==undefined && bold  !==a.boldPageNumber)   errors.push('Bold→'+a.boldPageNumber);
    if(a.italicPageNumber!==undefined && italic!==a.italicPageNumber) errors.push('Italic→'+a.italicPageNumber);
    if(a.markAll!==undefined && all!==a.markAll) errors.push('Cần bấm nút→'+(a.markAll?'Mark All':'Mark'));

    if(errors.length){_showPopupError('pp_err_insertindex','❌ Chưa đúng! '+errors.join(' | '));return;}

    if(a.activeTab==='markEntry'){
        closeMosPopup(); checkCorrect();
    } else {
        window._ppIdxMarked = true;
        _showPopupError('pp_err_insertindex','✅ Đã đánh dấu mục lục. Chuyển sang tab "Index" để tiếp tục.');
        const el = document.getElementById('pp_err_insertindex');
        if(el){ el.style.color='#16a34a'; el.style.background='#ecfdf5'; el.style.borderColor='#86efac'; }
    }
}
function checkInsertIndexPopup(){
    _hidePopupError('pp_err_insertindex');
    const a = window._ppAns||{};
    const tab = window._ppIdxActiveTab||'markEntry';

    if(a.activeTab && tab!==a.activeTab){
        _showPopupError('pp_err_insertindex','❌ Bước này cần thao tác ở tab: <b>'+(a.activeTab==='markEntry'?'Mark Index Entry':'Index')+'</b>');
        return;
    }
    if(tab==='markEntry'){
        _showPopupError('pp_err_insertindex','⚠️ Hãy bấm nút "Mark" hoặc "Mark All" để xác nhận, không dùng nút OK.');
        return;
    }

    const indexType = (document.querySelector('input[name="pp_idx_type"]:checked')||{}).value||'';
    const columns   = parseInt(document.getElementById('pp_idx_columns').value)||0;
    const rightAlign= (document.getElementById('pp_idx_rightAlign')||{}).checked||false;
    const tabLeader = document.getElementById('pp_idx_tabLeader').value;
    const formats   = document.getElementById('pp_idx_formats').value;

    let errors=[];
    if(a.indexType && indexType!==a.indexType) errors.push('Type→'+a.indexType);
    if(a.columns!==undefined&&(isNaN(columns)||columns!==a.columns)) errors.push('Columns→'+a.columns);
    if(a.rightAlignPageNumbers!==undefined && rightAlign!==a.rightAlignPageNumbers) errors.push('Right align→'+a.rightAlignPageNumbers);
    if(a.tabLeader && tabLeader!==a.tabLeader) errors.push('Tab leader→'+a.tabLeader);
    if(a.formats   && formats  !==a.formats)   errors.push('Formats→'+a.formats);

    if(errors.length){_showPopupError('pp_err_insertindex','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}


/* ============================================================
   45. POPUP ACCEPT/REJECT TRACKED CHANGES — copy vào HTML
popupType: 'track-changes-review',
popupAnswer: {
  changes: [
    { author:'An Nguyen', desc:'Inserted "quarterly"' },
    { author:'An Nguyen', desc:'Deleted "monthly"' },
    { author:'Le Van B',  desc:'Formatted: Bold' },
  	],
  expected: [
    { index: 1, action: 'Accept' },
    { index: 2, action: 'Reject' },
    { index: 3, action: 'Accept' },
  	],
}},
//chấp nhận 1,3 không chấp nhận 2
//chấp nhận cụ thể, tất cả   scope: 'This', // 'This' | 'All'
popupType: 'track-changes-review',
popupAnswer: {
  	changes: [
    	{ author:'An Nguyen', desc:'Inserted "quarterly"' },
    	{ author:'An Nguyen', desc:'Deleted "monthly"' },
    	{ author:'Le Van B',  desc:'Formatted: Bold' },
 	 	],
 	action:      'Accept',      
  	scope:       'This',     
  	targetIndex: 2,        }},
   ============================================================
popupType: 'track-changes-review',
popupAnswer: {
  changes: [
    { author:'An Nguyen', desc:'Inserted "quarterly"' },
    { author:'An Nguyen', desc:'Deleted "monthly"' },
    { author:'Le Van B',  desc:'Formatted: Bold' },
  ],

  // ── CÁCH 1: xử lý 1 dòng duy nhất, hoặc Accept/Reject TẤT CẢ ──
  action:      'Accept',      // 'Accept' | 'Reject'
  scope:       'This',        // 'This' | 'All'
  targetIndex: 2,             // chỉ cần khi scope:'This' — số thứ tự (1-based)

  // ── CÁCH 2 (MỚI): xử lý NHIỀU dòng khác nhau, mỗi dòng 1 hành động riêng ──
  // Nếu khai báo "expected", bỏ qua action/scope/targetIndex ở trên.
  // expected: [
  //   { index: 1, action: 'Accept' },
  //   { index: 3, action: 'Accept' },
  //   { index: 2, action: 'Reject' },
  // ],
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
Học sinh xử lý xong bao nhiêu dòng tuỳ ý (không bắt buộc xử lý hết), rồi bấm OK — popup mới chấm và đóng lại.
============================================================ */
function openTrackChangesReviewPopup(step){
    const box = _createPopupShell('Review — Tracked Changes');
    const ans = step.popupAnswer || {};

    const changes = ans.changes || [
        { author:'Reviewer 1', desc:'Inserted text' },
        { author:'Reviewer 2', desc:'Deleted text' },
    ];

    window._ppAns = {
        action:      ans.action || 'Accept',
        scope:       ans.scope  || 'This',
        targetIndex: ('targetIndex' in ans) ? ans.targetIndex : undefined,
        expected:    Array.isArray(ans.expected) ? ans.expected : undefined,
    };
    window._ppTcSelected = 0;
    window._ppTcChanges  = changes;
    window._ppTcResolved = changes.map(function(){ return null; });

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:440px;gap:0;padding:0;font-size:14px;';

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;gap:8px;padding:8px 14px;border-bottom:1px solid #e2e8f0;background:#f8fafc;flex-wrap:wrap;';
    toolbar.innerHTML = `
        <div style="display:flex;gap:4px;">
            <button type="button" class="pp-btn" onclick="pp_tcNav(-1)">◀ Previous</button>
            <button type="button" class="pp-btn" onclick="pp_tcNav(1)">Next ▶</button>
        </div>
        <div style="position:relative;">
            <button type="button" class="pp-btn pp-btn-ok" onclick="pp_tcToggleMenu('accept')">✔ Accept ▾</button>
            <div id="pp_tc_menuAccept" style="display:none;position:absolute;top:100%;left:0;background:#fff;
                border:1px solid #94a3b8;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,.15);z-index:20;min-width:200px;">
                <div onclick="pp_tcApply('Accept','This')" style="padding:7px 12px;cursor:pointer;">Accept This Change</div>
                <div onclick="pp_tcApply('Accept','All')"  style="padding:7px 12px;cursor:pointer;border-top:1px solid #f1f5f9;">Accept All Changes</div>
            </div>
        </div>
        <div style="position:relative;">
            <button type="button" class="pp-btn" style="background:#fee2e2;color:#dc2626;" onclick="pp_tcToggleMenu('reject')">✖ Reject ▾</button>
            <div id="pp_tc_menuReject" style="display:none;position:absolute;top:100%;left:0;background:#fff;
                border:1px solid #94a3b8;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,.15);z-index:20;min-width:200px;">
                <div onclick="pp_tcApply('Reject','This')" style="padding:7px 12px;cursor:pointer;">Reject This Change</div>
                <div onclick="pp_tcApply('Reject','All')"  style="padding:7px 12px;cursor:pointer;border-top:1px solid #f1f5f9;">Reject All Changes</div>
            </div>
        </div>`;
    body.appendChild(toolbar);

    const list = document.createElement('div');
    list.id = 'pp_tc_list';
    list.style.cssText = 'padding:8px 14px;max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;';
    changes.forEach(function(c, i){
        const row = document.createElement('div');
        row.id = 'pp_tc_item_'+i;
        row.style.cssText = 'padding:8px 10px;border:2px solid '+(i===0?'#2563eb':'#e2e8f0')+';border-radius:4px;'
            +'background:'+(i===0?'#eff6ff':'#fff')+';cursor:pointer;';
        row.innerHTML = '<b style="font-size:14px;color:#1e3a5f;">'+c.author+'</b>'
            +' <span style="font-size:14px;color:#64748b;">— '+c.desc+'</span>'
            +'<span id="pp_tc_status_'+i+'" style="float:right;font-size:14px;font-weight:bold;"></span>';
        row.addEventListener('click', function(){ pp_tcSelect(i); });
        list.appendChild(row);
    });
    body.appendChild(list);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_trackchanges';
    errDiv.style.margin = '0 14px 8px';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkTrackChangesReviewPopup()">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button').forEach(function(el){ el.style.fontSize='14px'; });

    document.addEventListener('click', function(e){
        const mA = document.getElementById('pp_tc_menuAccept');
        const mR = document.getElementById('pp_tc_menuReject');
        const insideMenu = (mA && mA.contains(e.target)) || (mR && mR.contains(e.target));
        const isToggleBtn = e.target && e.target.tagName==='BUTTON' && /Accept|Reject/.test(e.target.textContent||'');
        if(!insideMenu && !isToggleBtn){
            if(mA){ mA.style.display='none'; }
            if(mR){ mR.style.display='none'; }
        }
    });
}
function pp_tcSelect(i){
    window._ppTcSelected = i;
    const changes = window._ppTcChanges||[];
    changes.forEach(function(c, idx){
        const row = document.getElementById('pp_tc_item_'+idx);
        if(row && window._ppTcResolved[idx]===null){
            row.style.border     = (idx===i) ? '2px solid #2563eb' : '2px solid #e2e8f0';
            row.style.background = (idx===i) ? '#eff6ff' : '#fff';
        }
    });
}
function pp_tcNav(dir){
    const changes = window._ppTcChanges||[];
    let i = window._ppTcSelected + dir;
    if(i<0) i=0; if(i>=changes.length) i=changes.length-1;
    pp_tcSelect(i);
}
function pp_tcToggleMenu(which){
    const mA = document.getElementById('pp_tc_menuAccept');
    const mR = document.getElementById('pp_tc_menuReject');
    if(which==='accept'){ mR.style.display='none'; mA.style.display = (mA.style.display==='none')?'block':'none'; }
    else { mA.style.display='none'; mR.style.display = (mR.style.display==='none')?'block':'none'; }
}

/* ── MỚI: chỉ CẬP NHẬT trạng thái từng dòng, KHÔNG tự chấm/đóng popup nữa ──
   Học sinh có thể Accept/Reject nhiều dòng khác nhau tuỳ ý, xong hết mới bấm OK. */
function pp_tcApply(action, scope){
    _hidePopupError('pp_err_trackchanges');
    const mA = document.getElementById('pp_tc_menuAccept');
    const mR = document.getElementById('pp_tc_menuReject');
    if(mA){ mA.style.display='none'; }
    if(mR){ mR.style.display='none'; }

    const changes = window._ppTcChanges||[];
    const idx = window._ppTcSelected;

    if(scope==='All'){
        changes.forEach(function(c, i){
            window._ppTcResolved[i] = action;
            const st = document.getElementById('pp_tc_status_'+i);
            if(st){ st.textContent = (action==='Accept') ? '✔ Đã Accept' : '✖ Đã Reject'; st.style.color = (action==='Accept') ? '#16a34a' : '#dc2626'; }
        });
    } else {
        window._ppTcResolved[idx] = action;
        const st = document.getElementById('pp_tc_status_'+idx);
        if(st){ st.textContent = (action==='Accept') ? '✔ Đã Accept' : '✖ Đã Reject'; st.style.color = (action==='Accept') ? '#16a34a' : '#dc2626'; }

        /* Tự động chuyển sang dòng tiếp theo còn "treo" để học sinh xử lý tiếp, giống thao tác Next thật trong Word */
        const nextPending = window._ppTcResolved.findIndex(function(v,i){ return i>idx && v===null; });
        if(nextPending !== -1){ pp_tcSelect(nextPending); }
    }
}

/* ── MỚI: hàm chấm điểm — chỉ chạy khi bấm nút OK ── */
function checkTrackChangesReviewPopup(){
    _hidePopupError('pp_err_trackchanges');
    const a = window._ppAns||{};
    const resolved = window._ppTcResolved||[];
    let errors=[];

    if(Array.isArray(a.expected) && a.expected.length){
        /* ── CÁCH 2: nhiều dòng, mỗi dòng 1 hành động riêng ── */
        a.expected.forEach(function(exp){
            const i = exp.index - 1;
            const got = resolved[i];
            if(got !== exp.action){
                errors.push('Dòng '+exp.index+'→'+(exp.action==='Accept'?'cần Accept':'cần Reject')
                    +(got ? ' (hiện đang: '+got+')' : ' (chưa xử lý)'));
            }
        });
    } else {
        /* ── CÁCH 1: 1 dòng duy nhất hoặc Accept/Reject All (giữ tương thích ngược) ── */
        if(a.scope==='All'){
            const allDone = resolved.every(function(v){ return v===a.action; });
            if(!allDone) errors.push((a.action==='Accept'?'Cần Accept':'Cần Reject')+' TẤT CẢ các thay đổi');
        } else {
            const i = (a.targetIndex||1) - 1;
            const got = resolved[i];
            if(got !== a.action){
                errors.push('Dòng '+(a.targetIndex||1)+'→'+(a.action==='Accept'?'cần Accept':'cần Reject')
                    +(got ? ' (hiện đang: '+got+')' : ' (chưa xử lý)'));
            }
        }
    }

    if(errors.length){
        _showPopupError('pp_err_trackchanges','❌ Chưa đúng! '+errors.join(' | '));
        return;
    }
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   46. POPUP MAIL MERGE — copy vào HTML
   popupType: 'mail-merge'
   ============================================================
popupType: 'mail-merge',
popupAnswer: {
  step: 'startMerge',        // 'startMerge' | 'selectRecipients' | 'insertField' | 'finishMerge'

  // ── step: 'startMerge' ──
  mergeType: 'Letters',      // 'Letters'|'E-mail Messages'|'Envelopes'|'Labels'|'Directory'|'Normal Word Document'

  // ── step: 'selectRecipients' ──
  recipientSource: 'Use an Existing List',  // 'Type a New List'|'Use an Existing List'|'Choose from Outlook Contacts'
  correctFile:     'contacts.xlsx',   // chỉ chấm khi recipientSource:'Use an Existing List'
  correctFolder:   'Misc',            // tuỳ chọn — chỉ chấm nếu câu hỏi yêu cầu đúng cả thư mục

  // ── step: 'insertField' ──
  fieldName: 'FirstName',

  // ── step: 'finishMerge' ──
  finishAction: 'Send E-mail Messages',  // 'Print Documents'|'Edit Individual Documents'|'Send E-mail Messages'
  toField:      'Email_Address',         // chỉ chấm khi finishAction:'Send E-mail Messages'
  subjectLine:  'Welcome',
  mailFormat:   'HTML',                  // 'HTML'|'Plain Text'|'Attachment'
  sendRecords:  'All',                   // 'All'|'Current record'
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
function openMailMergePopup(step){
    const ans = step.popupAnswer || {};
    const mmStep = ans.step || 'startMerge';

    const titles = {
        startMerge:        'Start Mail Merge',
        selectRecipients:  'Select Recipients',
        insertField:       'Insert Merge Field',
        finishMerge:       'Finish & Merge',
    };
    const box = _createPopupShell(titles[mmStep] || 'Mail Merge');

    window._ppAns = {
        step:            mmStep,
        mergeType:       ('mergeType'       in ans) ? ans.mergeType       : undefined,
        recipientSource: ('recipientSource' in ans) ? ans.recipientSource : undefined,
        correctFile:     ('correctFile'     in ans) ? ans.correctFile     : undefined,
        correctFolder:   ('correctFolder'   in ans) ? ans.correctFolder   : undefined,
        fieldName:       ('fieldName'       in ans) ? ans.fieldName       : undefined,
        finishAction:    ('finishAction'    in ans) ? ans.finishAction    : undefined,
        toField:         ('toField'         in ans) ? ans.toField         : undefined,
        subjectLine:     ('subjectLine'     in ans) ? ans.subjectLine     : undefined,
        mailFormat:      ('mailFormat'      in ans) ? ans.mailFormat      : undefined,
        sendRecords:     ('sendRecords'     in ans) ? ans.sendRecords     : undefined,
    };
    window._ppMmBrowseFiles = ans.browseFiles || [
        { name:'contacts.xlsx',   folder:'Misc' },
        { name:'customers.xlsx',  folder:'Misc' },
        { name:'employees.xlsx', folder:'Documents' },
    ];
    window._ppMmSelectedFile   = null;
    window._ppMmSelectedFolder = null;
    window._ppMmActiveFolder   = null;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:420px;gap:10px;padding:14px 16px;font-size:14px;position:relative;';

    /* ══ Bước: Start Mail Merge ══ */
    if(mmStep === 'startMerge'){
        body.innerHTML = `
        <div style="font-size:14px;color:#374151;margin-bottom:4px;">Select document type:</div>
        <div id="pp_mm_typeList" style="display:flex;flex-direction:column;gap:2px;border:1px solid #cbd5e1;border-radius:4px;overflow:hidden;">
            ${['Letters','E-mail Messages','Envelopes','Labels','Directory','Normal Word Document'].map(function(t){
                return '<label style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-bottom:1px solid #f1f5f9;">'
                    +'<input type="radio" name="pp_mm_type" value="'+t+'"> '+t+'</label>';
            }).join('')}
        </div>
        <div class="pp-error" id="pp_err_mailmerge"></div>
        <div class="pp-btn-row">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
            <button class="pp-btn pp-btn-ok" onclick="checkMailMergePopup()">OK</button>
        </div>`;
    }

    /* ══ Bước: Select Recipients ══ */
    else if(mmStep === 'selectRecipients'){
        body.innerHTML = `
        <div id="pp_mm_srcList" style="display:flex;flex-direction:column;gap:4px;">
            ${['Type a New List','Use an Existing List','Choose from Outlook Contacts'].map(function(t){
                return '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">'
                    +'<input type="radio" name="pp_mm_src" value="'+t+'" onchange="pp_mmToggleBrowseRow()"> '+t+'</label>';
            }).join('')}
        </div>
        <div id="pp_mm_browseRow" style="display:none;gap:6px;align-items:center;">
            <input type="text" id="pp_mm_fileName" readonly placeholder="Chưa chọn file — bấm Browse..."
                style="flex:1;padding:5px 8px;border:1px solid #94a3b8;border-radius:3px;background:#f8fafc;color:#374151;">
            <button type="button" class="pp-btn" style="padding:4px 12px;" onclick="pp_mmToggleBrowse()">Browse...</button>
        </div>
        <div id="pp_mm_browsePanel" style="display:none;position:absolute;left:16px;right:16px;background:#fff;
            border:1px solid #94a3b8;border-radius:4px;box-shadow:0 6px 18px rgba(0,0,0,0.18);z-index:30;">
            <div id="pp_mm_folderTabs" style="display:flex;gap:2px;padding:6px 8px;border-bottom:1px solid #e2e8f0;background:#f8fafc;flex-wrap:wrap;"></div>
            <div id="pp_mm_fileList" style="max-height:150px;overflow-y:auto;padding:4px;"></div>
        </div>
        <div class="pp-error" id="pp_err_mailmerge"></div>
        <div class="pp-btn-row">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
            <button class="pp-btn pp-btn-ok" onclick="checkMailMergePopup()">OK</button>
        </div>`;
    }

    /* ══ Bước: Insert Merge Field ══ */
    else if(mmStep === 'insertField'){
        const fields = ['FirstName','LastName','Email_Address','Address_Line_1','City','State','ZIP_Code'];
        body.innerHTML = `
        <div style="font-size:14px;color:#374151;margin-bottom:4px;">Insert Merge Field:</div>
        <div id="pp_mm_fieldList" style="display:flex;flex-direction:column;gap:2px;border:1px solid #cbd5e1;
            border-radius:4px;overflow:hidden;max-height:200px;overflow-y:auto;">
            ${fields.map(function(f){
                return '<div class="pp-mm-field-item" data-field="'+f+'" onclick="pp_mmSelectField(this)"'
                    +' style="padding:7px 10px;cursor:pointer;border-bottom:1px solid #f1f5f9;color:#374151;">«'+f+'»</div>';
            }).join('')}
        </div>
        <div class="pp-error" id="pp_err_mailmerge"></div>
        <div class="pp-btn-row">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Close</button>
            <button class="pp-btn pp-btn-ok" onclick="checkMailMergePopup()">Insert</button>
        </div>`;
    }

    /* ══ Bước: Finish & Merge ══ */
    else if(mmStep === 'finishMerge'){
        body.innerHTML = `
        <div id="pp_mm_finishList" style="display:flex;flex-direction:column;gap:4px;">
            ${['Print Documents','Edit Individual Documents','Send E-mail Messages'].map(function(t){
                return '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">'
                    +'<input type="radio" name="pp_mm_finish" value="'+t+'" onchange="pp_mmToggleEmailForm()"> '+t+'</label>';
            }).join('')}
        </div>
        <div id="pp_mm_emailForm" style="display:none;flex-direction:column;gap:8px;border-top:1px solid #e2e8f0;padding-top:10px;">
            <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;">
                <label>To:</label>
                <select id="pp_mm_toField">
                    <option value="">-- Chọn trường --</option>
                    <option value="Email_Address">Email_Address</option>
                    <option value="FirstName">FirstName</option>
                    <option value="LastName">LastName</option>
                </select>
                <label>Subject line:</label>
                <input type="text" id="pp_mm_subject" placeholder="Nhập tiêu đề email...">
                <label>Mail format:</label>
                <select id="pp_mm_mailFormat">
                    <option value="HTML">HTML</option>
                    <option value="Plain Text">Plain Text</option>
                    <option value="Attachment">Attachment</option>
                </select>
            </div>
            <div class="pp-group-title" style="margin:0;">Send records</div>
            <div style="display:flex;gap:16px;">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                    <input type="radio" name="pp_mm_sendrec" value="All"> All
                </label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                    <input type="radio" name="pp_mm_sendrec" value="Current record"> Current record
                </label>
            </div>
        </div>
        <div class="pp-error" id="pp_err_mailmerge"></div>
        <div class="pp-btn-row">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
            <button class="pp-btn pp-btn-ok" onclick="checkMailMergePopup()">OK</button>
        </div>`;
    }

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button,div').forEach(function(el){ el.style.fontSize='14px'; });

    setTimeout(function(){
        const defaults = { 'Print Documents':true };
        if(mmStep==='finishMerge'){ pp_mmToggleEmailForm(); }
    }, 0);
}

/* ── Chọn 1 field trong danh sách Insert Merge Field ── */
function pp_mmSelectField(el){
    document.querySelectorAll('.pp-mm-field-item').forEach(function(it){
        it.style.background=''; it.style.color='#374151'; it.style.fontWeight='normal';
    });
    el.style.background = '#dbeafe';
    el.style.color      = '#1d4ed8';
    el.style.fontWeight = 'bold';
    window._ppMmSelectedField = el.dataset.field;
}

/* ── Bật/tắt hàng Browse khi chọn "Use an Existing List" ── */
function pp_mmToggleBrowseRow(){
    const sel = document.querySelector('input[name="pp_mm_src"]:checked');
    const row = document.getElementById('pp_mm_browseRow');
    if(!row){return;}
    row.style.display = (sel && sel.value==='Use an Existing List') ? 'flex' : 'none';
}

/* ── Mở/đóng khung Browse file (Select Recipients) ── */
function pp_mmToggleBrowse(){
    const panel = document.getElementById('pp_mm_browsePanel');
    if(!panel){return;}
    const isOpen = panel.style.display === 'block';
    if(isOpen){ panel.style.display='none'; return; }

    const files = window._ppMmBrowseFiles||[];
    const folders = [];
    files.forEach(function(f){ if(folders.indexOf(f.folder)===-1){ folders.push(f.folder); } });
    if(!window._ppMmActiveFolder){ window._ppMmActiveFolder = folders[0]; }

    const tabsEl = document.getElementById('pp_mm_folderTabs');
    tabsEl.innerHTML = '';
    folders.forEach(function(fd){
        const tb = document.createElement('div');
        tb.textContent = '📁 '+fd;
        tb.dataset.folder = fd;
        tb.style.cssText = 'padding:5px 10px;cursor:pointer;font-size:14px;border-radius:3px;color:#374151;'
            +(fd===window._ppMmActiveFolder ? 'background:#dbeafe;font-weight:bold;color:#1d4ed8;' : '');
        tb.addEventListener('click', function(){
            window._ppMmActiveFolder = fd;
            pp_mmRenderFileList();
            Array.from(tabsEl.children).forEach(function(el){
                const on = el.dataset.folder===fd;
                el.style.background = on ? '#dbeafe' : '';
                el.style.fontWeight  = on ? 'bold' : 'normal';
                el.style.color       = on ? '#1d4ed8' : '#374151';
            });
        });
        tabsEl.appendChild(tb);
    });
    pp_mmRenderFileList();
    panel.style.display = 'block';
}
function pp_mmRenderFileList(){
    const listEl = document.getElementById('pp_mm_fileList');
    if(!listEl){return;}
    const files = (window._ppMmBrowseFiles||[]).filter(function(f){ return f.folder===window._ppMmActiveFolder; });
    listEl.innerHTML = '';
    files.forEach(function(f){
        const row = document.createElement('div');
        row.textContent = '📄 '+f.name;
        row.style.cssText = 'padding:6px 10px;cursor:pointer;font-size:14px;color:#374151;border-radius:3px;';
        row.addEventListener('mouseenter', function(){ row.style.background='#eff6ff'; });
        row.addEventListener('mouseleave', function(){ row.style.background=''; });
        row.addEventListener('click', function(){
            window._ppMmSelectedFile   = f.name;
            window._ppMmSelectedFolder = f.folder;
            const input = document.getElementById('pp_mm_fileName');
            if(input){ input.value = f.name; }
            document.getElementById('pp_mm_browsePanel').style.display='none';
            _hidePopupError('pp_err_mailmerge');
        });
        listEl.appendChild(row);
    });
}

/* ── Bật/tắt form Email khi chọn "Send E-mail Messages" ── */
function pp_mmToggleEmailForm(){
    const sel = document.querySelector('input[name="pp_mm_finish"]:checked');
    const form = document.getElementById('pp_mm_emailForm');
    if(!form){return;}
    form.style.display = (sel && sel.value==='Send E-mail Messages') ? 'flex' : 'none';
}

function checkMailMergePopup(){
    _hidePopupError('pp_err_mailmerge');
    const a = window._ppAns||{};
    let errors=[];

    if(a.step==='startMerge'){
        const el = document.querySelector('input[name="pp_mm_type"]:checked');
        const val = el ? el.value : '';
        if(!val){ _showPopupError('pp_err_mailmerge','⚠️ Hãy chọn loại tài liệu.'); return; }
        if(a.mergeType && val!==a.mergeType) errors.push('Document type→'+a.mergeType);

    } else if(a.step==='selectRecipients'){
        const el = document.querySelector('input[name="pp_mm_src"]:checked');
        const val = el ? el.value : '';
        if(!val){ _showPopupError('pp_err_mailmerge','⚠️ Hãy chọn nguồn danh sách.'); return; }
        if(a.recipientSource && val!==a.recipientSource) errors.push('Recipient source→'+a.recipientSource);
        if(val==='Use an Existing List'){
            if(!window._ppMmSelectedFile){ _showPopupError('pp_err_mailmerge','⚠️ Hãy Browse và chọn file.'); return; }
            if(a.correctFile   && window._ppMmSelectedFile  !==a.correctFile)   errors.push('File→"'+a.correctFile+'"');
            if(a.correctFolder && window._ppMmSelectedFolder!==a.correctFolder) errors.push('Thư mục→"'+a.correctFolder+'"');
        }

    } else if(a.step==='insertField'){
        if(!window._ppMmSelectedField){ _showPopupError('pp_err_mailmerge','⚠️ Hãy chọn 1 trường để chèn.'); return; }
        if(a.fieldName && window._ppMmSelectedField!==a.fieldName) errors.push('Field→«'+a.fieldName+'»');

    } else if(a.step==='finishMerge'){
        const el = document.querySelector('input[name="pp_mm_finish"]:checked');
        const val = el ? el.value : '';
        if(!val){ _showPopupError('pp_err_mailmerge','⚠️ Hãy chọn hành động Finish & Merge.'); return; }
        if(a.finishAction && val!==a.finishAction) errors.push('Finish action→'+a.finishAction);
        if(val==='Send E-mail Messages'){
            const toF   = document.getElementById('pp_mm_toField').value;
            const subj  = (document.getElementById('pp_mm_subject')||{}).value||'';
            const mfmt  = document.getElementById('pp_mm_mailFormat').value;
            const srEl  = document.querySelector('input[name="pp_mm_sendrec"]:checked');
            const sr    = srEl ? srEl.value : '';
            if(a.toField     && toF !==a.toField)     errors.push('To→'+a.toField);
            if(a.subjectLine !==undefined && subj.trim()!==a.subjectLine) errors.push('Subject line→"'+a.subjectLine+'"');
            if(a.mailFormat  && mfmt!==a.mailFormat)   errors.push('Mail format→'+a.mailFormat);
            if(a.sendRecords && sr  !==a.sendRecords)  errors.push('Send records→'+a.sendRecords);
        }
    }

    if(errors.length){_showPopupError('pp_err_mailmerge','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}


/* ============================================================
   47. POPUP INSERT EQUATION — copy vào HTML
   popupType: 'insert-equation'
   ============================================================
popupType: 'insert-equation',
popupAnswer: {
  mode: 'gallery',                        // 'gallery' | 'new'
  galleryEquation: 'Pythagorean Theorem',  // chỉ chấm khi mode:'gallery'
  structure: 'Fraction',                   // chỉ chấm khi mode:'new'
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
var _EQ_GALLERY = [
    'Area of Circle','Binomial Theorem','Expansion of a Sum','Fourier Series',
    'Pythagorean Theorem','Quadratic Formula','Taylor Series',
];
var _EQ_STRUCTURES = [
    'Fraction','Script','Radical','Integral','Large Operator',
    'Bracket','Function','Accent','Limit and Log','Operator','Matrix',
];
function openInsertEquationPopup(step){
    const box = _createPopupShell('Equation');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        mode:            ans.mode || 'gallery',
        galleryEquation: ('galleryEquation' in ans) ? ans.galleryEquation : undefined,
        structure:       ('structure'       in ans) ? ans.structure       : undefined,
    };
    window._ppEqSelectedGallery   = null;
    window._ppEqSelectedStructure = null;
    window._ppEqMode = 'gallery';

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:400px;gap:0;padding:0;font-size:14px;';

    const menu = document.createElement('div');
    menu.id = 'pp_eq_menu';
    menu.style.cssText = 'display:flex;flex-direction:column;padding:6px 0;max-height:260px;overflow-y:auto;';
    _EQ_GALLERY.forEach(function(name){
        const row = document.createElement('div');
        row.dataset.gallery = name;
        row.style.cssText = 'padding:8px 14px;cursor:pointer;color:#374151;border-bottom:1px solid #f1f5f9;';
        row.innerHTML = '∑ <i style="font-style:italic;">'+name+'</i>';
        row.addEventListener('mouseenter', function(){ row.style.background='#eff6ff'; });
        row.addEventListener('mouseleave', function(){ row.style.background=''; });
        row.addEventListener('click', function(){ pp_eqSelectGallery(name); });
        menu.appendChild(row);
    });
    const newEqRow = document.createElement('div');
    newEqRow.style.cssText = 'padding:8px 14px;cursor:pointer;color:#2563eb;font-weight:bold;border-top:2px solid #e2e8f0;';
    newEqRow.textContent = '➕ Insert New Equation';
    newEqRow.addEventListener('mouseenter', function(){ newEqRow.style.background='#eff6ff'; });
    newEqRow.addEventListener('mouseleave', function(){ newEqRow.style.background=''; });
    newEqRow.addEventListener('click', function(){ pp_eqShowNewEquation(); });
    menu.appendChild(newEqRow);
    body.appendChild(menu);

    /* ── Khung "Insert New Equation" — canvas + Structures ── */
    const newPanel = document.createElement('div');
    newPanel.id = 'pp_eq_newPanel';
    newPanel.style.display = 'none';
    newPanel.style.cssText = 'padding:12px 14px;flex-direction:column;gap:10px;';
    newPanel.innerHTML = `
        <div style="border:2px dashed #94a3b8;border-radius:4px;padding:20px;text-align:center;
            color:#94a3b8;font-size:16px;background:#f8fafc;">Type equation here.</div>
        <div class="pp-group-title" style="margin-top:0;">Structures</div>
        <div id="pp_eq_structGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;"></div>`;
    body.appendChild(newPanel);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_insertequation';
    errDiv.style.margin = '0 14px 8px';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button type="button" class="pp-btn" id="pp_eq_backBtn" style="display:none;" onclick="pp_eqShowGallery()">◀ Back</button>
        <div style="display:flex;gap:8px;margin-left:auto;">
            <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
            <button class="pp-btn pp-btn-ok" onclick="checkInsertEquationPopup()">OK</button>
        </div>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button,div,i').forEach(function(el){ el.style.fontSize='14px'; });

    /* Dựng lưới Structures */
    const structGrid = document.getElementById('pp_eq_structGrid');
    _EQ_STRUCTURES.forEach(function(s){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.struct = s;
        btn.textContent = s;
        btn.style.cssText = 'padding:8px 4px;font-size:14px;color:#374151;border:1px solid #94a3b8;'
            +'border-radius:3px;background:#fff;cursor:pointer;';
        btn.addEventListener('click', function(){ pp_eqSelectStructure(s); });
        structGrid.appendChild(btn);
    });
}
function pp_eqSelectGallery(name){
    _hidePopupError('pp_err_insertequation');
    window._ppEqSelectedGallery = name;
    document.querySelectorAll('#pp_eq_menu [data-gallery]').forEach(function(row){
        if(row.dataset.gallery===name){ row.style.background='#dbeafe'; row.style.fontWeight='bold'; }
        else{ row.style.background=''; row.style.fontWeight='normal'; }
    });
}
function pp_eqShowNewEquation(){
    document.getElementById('pp_eq_menu').style.display     = 'none';
    document.getElementById('pp_eq_newPanel').style.display = 'flex';
    document.getElementById('pp_eq_backBtn').style.display   = 'inline-block';
    window._ppEqMode = 'new';
    _hidePopupError('pp_err_insertequation');
}
function pp_eqShowGallery(){
    document.getElementById('pp_eq_menu').style.display     = 'flex';
    document.getElementById('pp_eq_newPanel').style.display = 'none';
    document.getElementById('pp_eq_backBtn').style.display   = 'none';
    window._ppEqMode = 'gallery';
    _hidePopupError('pp_err_insertequation');
}
function pp_eqSelectStructure(s){
    window._ppEqSelectedStructure = s;
    document.querySelectorAll('#pp_eq_structGrid [data-struct]').forEach(function(btn){
        if(btn.dataset.struct===s){ btn.style.border='2px solid #2563eb'; btn.style.background='#dbeafe'; }
        else{ btn.style.border='1px solid #94a3b8'; btn.style.background='#fff'; }
    });
    _hidePopupError('pp_err_insertequation');
}
function checkInsertEquationPopup(){
    _hidePopupError('pp_err_insertequation');
    const a = window._ppAns||{};
    const mode = window._ppEqMode;
    let errors=[];

    if(a.mode && mode!==a.mode){
        _showPopupError('pp_err_insertequation','❌ Chưa đúng! Cần chọn: '+(a.mode==='gallery'?'công thức có sẵn trong danh sách':'"Insert New Equation"'));
        return;
    }

    if(mode==='gallery'){
        if(!window._ppEqSelectedGallery){ _showPopupError('pp_err_insertequation','⚠️ Hãy chọn 1 công thức trong danh sách.'); return; }
        if(a.galleryEquation && window._ppEqSelectedGallery!==a.galleryEquation) errors.push('Equation→'+a.galleryEquation);
    } else {
        if(!window._ppEqSelectedStructure){ _showPopupError('pp_err_insertequation','⚠️ Hãy chọn 1 cấu trúc (Structures).'); return; }
        if(a.structure && window._ppEqSelectedStructure!==a.structure) errors.push('Structure→'+a.structure);
    }

    if(errors.length){_showPopupError('pp_err_insertequation','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   48. POPUP DOCUMENT PROPERTIES — TAB SUMMARY — copy vào HTML
popupType: 'doc-properties-summary',
popupAnswer: {
  	subject: 'Finance' }},
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo (tức là bỏ hẳn dòng đó luôn)
   ============================================================
popupType: 'doc-properties-summary',
popupAnswer: {
  title:               'Annual Report',
  subject:             'Finance',
  author:              'Nguyen Van A',
  manager:             'Tran Thi B',
  company:             'ABC Corp',
  category:            'Reports',
  keywords:            'finance, annual, 2026',
  comments:            'Draft version for review',
  hyperlinkBase:       'https://example.com',
  savePreviewPicture:  true }},
============================================================ */
function openDocPropertiesSummaryPopup(step){
    const box = _createPopupShell('Properties');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        title:              ('title'              in ans) ? ans.title              : undefined,
        subject:            ('subject'            in ans) ? ans.subject            : undefined,
        author:             ('author'             in ans) ? ans.author             : undefined,
        manager:            ('manager'            in ans) ? ans.manager            : undefined,
        company:            ('company'            in ans) ? ans.company            : undefined,
        category:           ('category'           in ans) ? ans.category           : undefined,
        keywords:           ('keywords'           in ans) ? ans.keywords           : undefined,
        comments:           ('comments'           in ans) ? ans.comments           : undefined,
        hyperlinkBase:      ('hyperlinkBase'      in ans) ? ans.hyperlinkBase      : undefined,
        savePreviewPicture: ('savePreviewPicture' in ans) ? ans.savePreviewPicture : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:460px;gap:0;padding:0;font-size:14px;';

    /* ── Tab bar — chỉ tab Summary hoạt động, các tab khác vẽ mờ để đúng bối cảnh Advanced Properties ── */
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;border-bottom:2px solid #94a3b8;padding:0 10px;background:#f1f5f9;';
    ['General','Summary','Statistics','Contents','Custom'].forEach(function(t){
        const td = document.createElement('div');
        td.textContent = t;
        const isSummary = (t==='Summary');
        td.style.cssText = 'padding:7px 14px;font-size:14px;'
            +(isSummary
                ? 'background:#fff;border:1px solid #94a3b8;border-bottom:2px solid #fff;margin-bottom:-2px;'
                  +'border-radius:3px 3px 0 0;font-weight:bold;color:#1e3a5f;cursor:default;'
                : 'color:#94a3b8;cursor:not-allowed;');
        tabBar.appendChild(td);
    });
    body.appendChild(tabBar);

    const content = document.createElement('div');
    content.style.cssText = 'padding:14px 16px;display:flex;flex-direction:column;gap:6px;max-height:65vh;overflow-y:auto;';
    content.innerHTML = `
    <div style="display:grid;grid-template-columns:110px 1fr;gap:6px 10px;align-items:center;">
        <label>Title:</label>
        <input type="text" id="pp_dp_title" placeholder="Nhập tiêu đề...">

        <label>Subject:</label>
        <input type="text" id="pp_dp_subject" placeholder="Nhập chủ đề...">

        <label>Author:</label>
        <input type="text" id="pp_dp_author" placeholder="Nhập tác giả...">

        <label>Manager:</label>
        <input type="text" id="pp_dp_manager" placeholder="Nhập tên quản lý...">

        <label>Company:</label>
        <input type="text" id="pp_dp_company" placeholder="Nhập tên công ty...">
    </div>

    <div style="border-top:1px solid #e2e8f0;margin:4px 0;"></div>

    <div style="display:grid;grid-template-columns:110px 1fr;gap:6px 10px;align-items:start;">
        <label>Category:</label>
        <input type="text" id="pp_dp_category" placeholder="Nhập danh mục...">

        <label>Keywords:</label>
        <input type="text" id="pp_dp_keywords" placeholder="Nhập từ khoá, cách nhau bởi dấu phẩy...">

        <label style="padding-top:4px;">Comments:</label>
        <textarea id="pp_dp_comments" rows="3" placeholder="Nhập ghi chú..."
            style="padding:5px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;
                   font-family:Arial,sans-serif;resize:vertical;box-sizing:border-box;"></textarea>
    </div>

    <div style="border-top:1px solid #e2e8f0;margin:4px 0;"></div>

    <div style="display:grid;grid-template-columns:110px 1fr;gap:6px 10px;align-items:center;">
        <label>Hyperlink<br>base:</label>
        <input type="text" id="pp_dp_hyperlinkBase" placeholder="Nhập đường dẫn gốc cho hyperlink...">

        <label>Template:</label>
        <input type="text" value="Normal.dotm" disabled class="pp-disabled">
    </div>

    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:4px;">
        <input type="checkbox" id="pp_dp_savePreview">
        Save preview picture
    </label>`;
    body.appendChild(content);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_docpropsummary';
    errDiv.style.margin = '0 16px 8px';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:10px 16px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkDocPropertiesSummaryPopup()">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button,textarea').forEach(function(el){ el.style.fontSize='14px'; });

    /* Giá trị hiển thị mặc định — CỐ ĐỊNH TRỐNG, không đọc từ ans (tránh lộ đáp án) */
    setTimeout(function(){
        ['pp_dp_title','pp_dp_subject','pp_dp_author','pp_dp_manager','pp_dp_company',
         'pp_dp_category','pp_dp_keywords','pp_dp_hyperlinkBase'].forEach(function(id){
            const el = document.getElementById(id);
            if(el){ el.value=''; }
        });
        document.getElementById('pp_dp_comments').value = '';
        document.getElementById('pp_dp_savePreview').checked = false;
    }, 0);
}
function checkDocPropertiesSummaryPopup(){
    _hidePopupError('pp_err_docpropsummary');
    const a = window._ppAns||{};

    const title         = (document.getElementById('pp_dp_title')||{}).value||'';
    const subject       = (document.getElementById('pp_dp_subject')||{}).value||'';
    const author        = (document.getElementById('pp_dp_author')||{}).value||'';
    const manager       = (document.getElementById('pp_dp_manager')||{}).value||'';
    const company       = (document.getElementById('pp_dp_company')||{}).value||'';
    const category      = (document.getElementById('pp_dp_category')||{}).value||'';
    const keywords      = (document.getElementById('pp_dp_keywords')||{}).value||'';
    const comments      = (document.getElementById('pp_dp_comments')||{}).value||'';
    const hyperlinkBase = (document.getElementById('pp_dp_hyperlinkBase')||{}).value||'';
    const savePreview   = (document.getElementById('pp_dp_savePreview')||{}).checked||false;

    let errors=[];
    if(a.title              !==undefined && title.trim()         !==a.title)              errors.push('Title→"'+a.title+'"');
    if(a.subject            !==undefined && subject.trim()       !==a.subject)             errors.push('Subject→"'+a.subject+'"');
    if(a.author             !==undefined && author.trim()        !==a.author)              errors.push('Author→"'+a.author+'"');
    if(a.manager            !==undefined && manager.trim()       !==a.manager)             errors.push('Manager→"'+a.manager+'"');
    if(a.company            !==undefined && company.trim()       !==a.company)             errors.push('Company→"'+a.company+'"');
    if(a.category           !==undefined && category.trim()      !==a.category)            errors.push('Category→"'+a.category+'"');
    if(a.keywords           !==undefined && keywords.trim()      !==a.keywords)             errors.push('Keywords→"'+a.keywords+'"');
    if(a.comments           !==undefined && comments.trim()      !==a.comments)             errors.push('Comments→"'+a.comments+'"');
    if(a.hyperlinkBase      !==undefined && hyperlinkBase.trim() !==a.hyperlinkBase)        errors.push('Hyperlink base→"'+a.hyperlinkBase+'"');
    if(a.savePreviewPicture !==undefined && savePreview          !==a.savePreviewPicture)   errors.push('Save preview picture→'+a.savePreviewPicture);

    if(errors.length){_showPopupError('pp_err_docpropsummary','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}

/* ============================================================
   49. POPUP FILE OPEN — copy vào HTML
popupType: 'file-open',
popupAnswer: {
	browseFiles: [
    { name:'Report.docx', folder:'Desktop' },   { name:'Report.pdf', folder:'Desktop' },
    { name:'Report.docx', folder:'Documents' }, { name:'Report.pdf', folder:'Documents' },
    { name:'Report.docx', folder:'Misc' }, 	{ name:'mosword2016.png', folder:'Misc' },
    { name:'Report.docx', folder:'C:\\' },      { name:'Report.pdf', folder:'C:\\' },
  	],
	correctFile:   'Report.docx',
  	correctFolder: 'Desktop' }},
//Đường dẫn sửa browseFiles: [	//đáp án sửa trùng correctFile, correctFolder
popupType: 'file-open',
popupAnswer: {
    btnLabel: 'Insert', // Hoặc dùng: actionType: 'insert'
    correctFile: 'Report.docx',
    correctFolder: 'Documents'}},
popupType: 'file-open',
popupAnswer: {
    btnLabel: 'Open',
    correctFile: 'Report.pdf',
    correctFolder: 'Desktop'}},
   ============================================================
popupType: 'file-open',
popupAnswer: {
  browseFiles: [
    { name:'Report.docx', folder:'Desktop' },   { name:'Report.pdf', folder:'Desktop' },
    { name:'Report.docx', folder:'Documents' }, { name:'Report.pdf', folder:'Documents' },
    { name:'Report.docx', folder:'Misc' }, 	{ name:'mosword2016.png', folder:'Misc' },
    { name:'Report.docx', folder:'C:\\' },      { name:'Report.pdf', folder:'C:\\' },
  	],
  correctFile:   'Report.docx',
  correctFolder: 'Desktop' }},
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
Đổi tên file/phần mở rộng trực tiếp trong browseFiles tuỳ theo câu hỏi (vd: đổi .docx -> .txt).
============================================================ */
function openFileOpenPopup(step){
    const ans = step.popupAnswer || {};
    
    // Tự động nhận tên nút ("Insert" hoặc "Open") từ Answer, mặc định là "Open"
    const btnLabel = ans.btnLabel || (ans.actionType === 'insert' ? 'Insert' : 'Open');
    const popupTitle = ans.popupTitle || btnLabel; 

    const box = _createPopupShell(popupTitle);
    const browseFiles = ans.browseFiles || [
        { name:'Report.docx', folder:'Desktop' }, 	{ name:'Report.pdf', folder:'Desktop' },
        { name:'Report.docx', folder:'Documents' },	{ name:'Report.pdf', folder:'Documents' },
        { name:'Company info.docx', folder:'Misc' },	{ name:'mosword2016.png', folder:'Misc' },
        { name:'Report.docx', folder:'C:\\' },     	{ name:'Report.pdf', folder:'C:\\' },
    ];

    window._ppAns = {
        correctFile:   ('correctFile'   in ans) ? ans.correctFile   : undefined,
        correctFolder: ('correctFolder' in ans) ? ans.correctFolder : undefined,
        btnLabel:      btnLabel
    };
    window._ppFoBrowseFiles   = browseFiles;
    window._ppFoSelectedFile  = null;
    window._ppFoSelectedFolder= null;
    window._ppFoActiveFolder  = null;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:440px;gap:0;padding:0;font-size:14px;position:relative;';

    /* ── Màn hình chính: Quick places + nút Browse ── */
    const mainPanel = document.createElement('div');
    mainPanel.id = 'pp_fo_mainPanel';
    mainPanel.style.cssText = 'padding:14px 16px;display:flex;flex-direction:column;gap:8px;';
    mainPanel.innerHTML = `
        <div style="font-size:14px;color:#64748b;">Recent</div>
        <div style="border:1px solid #e2e8f0;border-radius:4px;padding:14px;text-align:center;color:#94a3b8;">
            (Không có tài liệu gần đây)
        </div>
        <button type="button" class="pp-btn pp-btn-ok" style="align-self:flex-start;margin-top:6px;padding:8px 20px;"
            onclick="pp_foToggleBrowse()">📂 Browse...</button>`;
    body.appendChild(mainPanel);

    /* ── Khung Browse nổi: folder tabs + file list ── */
    const browsePanel = document.createElement('div');
    browsePanel.id = 'pp_fo_browsePanel';
    browsePanel.style.cssText = 'display:none;position:absolute;left:16px;right:16px;top:70px;background:#fff;'
        +'border:1px solid #94a3b8;border-radius:4px;box-shadow:0 8px 22px rgba(0,0,0,0.2);z-index:30;';
    browsePanel.innerHTML = `
        <div id="pp_fo_folderTabs" style="display:flex;gap:2px;padding:6px 8px;border-bottom:1px solid #e2e8f0;background:#f8fafc;flex-wrap:wrap;"></div>
        <div id="pp_fo_fileList" style="max-height:180px;overflow-y:auto;padding:4px;"></div>
        <div style="display:flex;justify-content:flex-end;gap:8px;padding:8px 10px;border-top:1px solid #e2e8f0;">
            <button type="button" class="pp-btn pp-btn-cancel" onclick="pp_foToggleBrowse()">Cancel</button>
            <button type="button" class="pp-btn pp-btn-ok" id="pp_fo_btnSubmit" onclick="pp_foConfirmOpen()">${btnLabel}</button>
        </div>`;
    body.appendChild(browsePanel);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_fileopen';
    errDiv.style.margin = '0 16px 8px';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;padding:10px 16px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button,div').forEach(function(el){ el.style.fontSize='14px'; });
}

function pp_foToggleBrowse(){
    const panel = document.getElementById('pp_fo_browsePanel');
    if(!panel){return;}
    const isOpen = panel.style.display === 'block';
    if(isOpen){ panel.style.display='none'; return; }

    const files = window._ppFoBrowseFiles||[];
    const folders = [];
    files.forEach(function(f){ if(folders.indexOf(f.folder)===-1){ folders.push(f.folder); } });
    if(!window._ppFoActiveFolder){ window._ppFoActiveFolder = folders[0]; }

    const tabsEl = document.getElementById('pp_fo_folderTabs');
    tabsEl.innerHTML = '';
    folders.forEach(function(fd){
        const tb = document.createElement('div');
        tb.textContent = '📁 '+fd;
        tb.dataset.folder = fd;
        tb.style.cssText = 'padding:5px 10px;cursor:pointer;font-size:14px;border-radius:3px;color:#374151;'
            +(fd===window._ppFoActiveFolder ? 'background:#dbeafe;font-weight:bold;color:#1d4ed8;' : '');
        tb.addEventListener('click', function(){
            window._ppFoActiveFolder = fd;
            pp_foRenderFileList();
            Array.from(tabsEl.children).forEach(function(el){
                const on = el.dataset.folder===fd;
                el.style.background = on ? '#dbeafe' : '';
                el.style.fontWeight  = on ? 'bold' : 'normal';
                el.style.color       = on ? '#1d4ed8' : '#374151';
            });
        });
        tabsEl.appendChild(tb);
    });
    pp_foRenderFileList();
    panel.style.display = 'block';
}

function pp_foRenderFileList(){
    const listEl = document.getElementById('pp_fo_fileList');
    if(!listEl){return;}
    const files = (window._ppFoBrowseFiles||[]).filter(function(f){ return f.folder===window._ppFoActiveFolder; });
    listEl.innerHTML = '';
    files.forEach(function(f){
        const row = document.createElement('div');
        row.dataset.name = f.name;
        row.textContent = '📄 '+f.name;
        row.style.cssText = 'padding:6px 10px;cursor:pointer;font-size:14px;color:#374151;border-radius:3px;';
        row.addEventListener('mouseenter', function(){ if(window._ppFoSelectedFile!==f.name) row.style.background='#eff6ff'; });
        row.addEventListener('mouseleave', function(){ if(window._ppFoSelectedFile!==f.name) row.style.background=''; });
        row.addEventListener('click', function(){
            window._ppFoSelectedFile   = f.name;
            window._ppFoSelectedFolder = f.folder;
            listEl.querySelectorAll('div[data-name]').forEach(function(el){ el.style.background=''; });
            row.style.background = '#dbeafe';
        });
        listEl.appendChild(row);
    });
}

function pp_foConfirmOpen(){
    _hidePopupError('pp_err_fileopen');
    const a = window._ppAns||{};
    const actionName = a.btnLabel || 'Open';

    if(!window._ppFoSelectedFile){
        _showPopupError('pp_err_fileopen', '⚠️ Hãy chọn 1 file trước khi bấm ' + actionName + '.');
        return;
    }

    let errors=[];
    if(a.correctFile   && window._ppFoSelectedFile  !==a.correctFile)   errors.push('File→"'+a.correctFile+'"');
    if(a.correctFolder && window._ppFoSelectedFolder!==a.correctFolder) errors.push('Thư mục→"'+a.correctFolder+'"');
    if(errors.length){_showPopupError('pp_err_fileopen','❌ Chưa đúng! '+errors.join(' | '));return;}
    
    closeMosPopup(); 
    checkCorrect();
}


/* ============================================================
   50. POPUP FILE SAVE AS — copy vào HTML
popupType: 'file-saveas',
popupAnswer: {
  browseFiles: [
    { name:'Report.docx', folder:'Desktop' },   { name:'Report.pdf', folder:'Desktop' },
    { name:'Report.docx', folder:'Documents' }, { name:'Report.pdf', folder:'Documents' },
    { name:'Report.docx', folder:'Downloads' }, { name:'Report.pdf', folder:'Downloads' },
    { name:'Report.docx', folder:'C:\\' },      { name:'Report.pdf', folder:'C:\\' },
  ],
  correctFolder:    'Desktop',
  fileName:         'Baocao2026',
  fileType:         'Word Document (*.docx)', 
  passwordToOpen:   'Open2026!',
  passwordToModify: 'Modify2026!' }},
   ============================================================
popupType: 'file-saveas',
popupAnswer: {
  browseFiles: [
    { name:'Report.docx', folder:'Desktop' },   { name:'Report.pdf', folder:'Desktop' },
    { name:'Report.docx', folder:'Documents' }, { name:'Report.pdf', folder:'Documents' },
    { name:'Report.docx', folder:'Downloads' }, { name:'Report.pdf', folder:'Downloads' },
    { name:'Report.docx', folder:'C:\\' },      { name:'Report.pdf', folder:'C:\\' },
  ],
  correctFolder:    'Desktop',
  fileName:         'Baocao2026',
  fileType:         'Word Document (*.docx)',   // 'Word Document (*.docx)'|'PDF (*.pdf)'|'Word 97-2003 Document (*.doc)'
  passwordToOpen:   'Open2026!',
  passwordToModify: 'Modify2026!',
}},
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
Đổi tên/phần mở rộng file mẫu trực tiếp trong browseFiles tuỳ theo câu hỏi.
============================================================ */
function openFileSaveAsPopup(step){
    const box = _createPopupShell('Save As');
    const ans = step.popupAnswer || {};

    const browseFiles = ans.browseFiles || [
        { name:'Report.docx', folder:'Desktop' }, { name:'Report.pdf', folder:'Desktop' },
        { name:'Report.docx', folder:'Documents' },{ name:'Report.pdf', folder:'Documents' },
        { name:'Report.docx', folder:'Downloads' },{ name:'Report.pdf', folder:'Downloads' },
        { name:'Report.docx', folder:'C:\\' },     { name:'Report.pdf', folder:'C:\\' },
    ];

    window._ppAns = {
        correctFolder:    ('correctFolder'    in ans) ? ans.correctFolder    : undefined,
        fileName:         ('fileName'         in ans) ? ans.fileName         : undefined,
        fileType:         ('fileType'         in ans) ? ans.fileType         : undefined,
        passwordToOpen:   ('passwordToOpen'   in ans) ? ans.passwordToOpen   : undefined,
        passwordToModify: ('passwordToModify' in ans) ? ans.passwordToModify : undefined,
    };
    window._ppSaBrowseFiles   = browseFiles;
    window._ppSaActiveFolder  = null;
    window._ppSaSelectedFolder= null;
    window._ppSaGeneralOptSet = false;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:460px;gap:0;padding:0;font-size:14px;position:relative;';

    /* ── Màn hình chính: nút Browse ── */
    const mainPanel = document.createElement('div');
    mainPanel.id = 'pp_sa2_mainPanel';
    mainPanel.style.cssText = 'padding:14px 16px;display:flex;flex-direction:column;gap:8px;';
    mainPanel.innerHTML = `
        <div style="font-size:14px;color:#64748b;">Chọn nơi lưu tài liệu.</div>
        <button type="button" class="pp-btn pp-btn-ok" style="align-self:flex-start;margin-top:6px;padding:8px 20px;"
            onclick="pp_sa2ToggleBrowse()">📂 Browse...</button>`;
    body.appendChild(mainPanel);

    /* ── Khung Save As đầy đủ: folder tabs + file list + Name/Type + Tools ── */
    const dlgPanel = document.createElement('div');
    dlgPanel.id = 'pp_sa2_dlgPanel';
    dlgPanel.style.cssText = 'display:none;position:absolute;left:16px;right:16px;top:70px;background:#fff;'
        +'border:1px solid #94a3b8;border-radius:4px;box-shadow:0 8px 22px rgba(0,0,0,0.2);z-index:30;';
    dlgPanel.innerHTML = `
        <div id="pp_sa2_folderTabs" style="display:flex;gap:2px;padding:6px 8px;border-bottom:1px solid #e2e8f0;background:#f8fafc;flex-wrap:wrap;"></div>
        <div id="pp_sa2_fileList" style="max-height:130px;overflow-y:auto;padding:4px;border-bottom:1px solid #e2e8f0;"></div>
        <div style="padding:10px;display:flex;flex-direction:column;gap:8px;">
            <div style="display:grid;grid-template-columns:90px 1fr;gap:6px;align-items:center;">
                <label>File name:</label>
                <input type="text" id="pp_sa2_fileName" placeholder="Nhập tên file...">
                <label>Save as type:</label>
                <select id="pp_sa2_fileType">
                    <option value="Word Document (*.docx)">Word Document (*.docx)</option>
                    <option value="PDF (*.pdf)">PDF (*.pdf)</option>
                    <option value="Word 97-2003 Document (*.doc)">Word 97-2003 Document (*.doc)</option>
                </select>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;position:relative;">
                <div style="position:relative;">
                    <button type="button" class="pp-btn" onclick="pp_sa2ToggleToolsMenu()">Tools ▾</button>
                    <div id="pp_sa2_toolsMenu" style="display:none;position:absolute;bottom:100%;left:0;margin-bottom:4px;
                        background:#fff;border:1px solid #94a3b8;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,.15);z-index:40;min-width:180px;">
                        <div onclick="pp_sa2OpenGeneralOptions()" style="padding:7px 12px;cursor:pointer;">General Options...</div>
                    </div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button type="button" class="pp-btn pp-btn-cancel" onclick="pp_sa2ToggleBrowse()">Cancel</button>
                    <button type="button" class="pp-btn pp-btn-ok" onclick="pp_sa2ConfirmSave()">Save</button>
                </div>
            </div>
        </div>

        <!-- Khung General Options (password) -->
        <div id="pp_sa2_generalOptions" style="display:none;position:absolute;inset:0;background:#fff;
            border:1px solid #94a3b8;border-radius:4px;padding:14px;z-index:50;">
            <div style="font-weight:bold;color:#1e3a5f;margin-bottom:10px;">General Options</div>
            <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;align-items:center;">
                <label>Password to open:</label>
                <input type="password" id="pp_sa2_pwOpen" placeholder="(tuỳ chọn)">
                <label>Password to modify:</label>
                <input type="password" id="pp_sa2_pwModify" placeholder="(tuỳ chọn)">
            </div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:8px;">
                <input type="checkbox" id="pp_sa2_readOnly"> Read-only recommended
            </label>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px;">
                <button type="button" class="pp-btn pp-btn-cancel" onclick="pp_sa2CloseGeneralOptions(false)">Cancel</button>
                <button type="button" class="pp-btn pp-btn-ok" onclick="pp_sa2CloseGeneralOptions(true)">OK</button>
            </div>
        </div>`;
    body.appendChild(dlgPanel);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_filesaveas';
    errDiv.style.margin = '0 16px 8px';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;padding:10px 16px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button,div').forEach(function(el){ el.style.fontSize='14px'; });
}
function pp_sa2ToggleBrowse(){
    const panel = document.getElementById('pp_sa2_dlgPanel');
    if(!panel){return;}
    const isOpen = panel.style.display === 'block';
    if(isOpen){ panel.style.display='none'; return; }

    const files = window._ppSaBrowseFiles||[];
    const folders = [];
    files.forEach(function(f){ if(folders.indexOf(f.folder)===-1){ folders.push(f.folder); } });
    if(!window._ppSaActiveFolder){ window._ppSaActiveFolder = folders[0]; }
    window._ppSaSelectedFolder = window._ppSaActiveFolder;

    const tabsEl = document.getElementById('pp_sa2_folderTabs');
    tabsEl.innerHTML = '';
    folders.forEach(function(fd){
        const tb = document.createElement('div');
        tb.textContent = '📁 '+fd;
        tb.dataset.folder = fd;
        tb.style.cssText = 'padding:5px 10px;cursor:pointer;font-size:14px;border-radius:3px;color:#374151;'
            +(fd===window._ppSaActiveFolder ? 'background:#dbeafe;font-weight:bold;color:#1d4ed8;' : '');
        tb.addEventListener('click', function(){
            window._ppSaActiveFolder   = fd;
            window._ppSaSelectedFolder = fd;
            pp_sa2RenderFileList();
            Array.from(tabsEl.children).forEach(function(el){
                const on = el.dataset.folder===fd;
                el.style.background = on ? '#dbeafe' : '';
                el.style.fontWeight  = on ? 'bold' : 'normal';
                el.style.color       = on ? '#1d4ed8' : '#374151';
            });
        });
        tabsEl.appendChild(tb);
    });
    pp_sa2RenderFileList();
    panel.style.display = 'block';
}
function pp_sa2RenderFileList(){
    const listEl = document.getElementById('pp_sa2_fileList');
    if(!listEl){return;}
    const files = (window._ppSaBrowseFiles||[]).filter(function(f){ return f.folder===window._ppSaActiveFolder; });
    listEl.innerHTML = '';
    if(files.length===0){
        listEl.innerHTML = '<div style="padding:8px;color:#94a3b8;font-size:14px;text-align:center;">— Thư mục trống —</div>';
        return;
    }
    files.forEach(function(f){
        const row = document.createElement('div');
        row.textContent = '📄 '+f.name;
        row.style.cssText = 'padding:5px 10px;font-size:14px;color:#94a3b8;';
        listEl.appendChild(row);
    });
}
function pp_sa2ToggleToolsMenu(){
    const menu = document.getElementById('pp_sa2_toolsMenu');
    if(!menu){return;}
    menu.style.display = (menu.style.display==='none') ? 'block' : 'none';
}
function pp_sa2OpenGeneralOptions(){
    document.getElementById('pp_sa2_toolsMenu').style.display = 'none';
    document.getElementById('pp_sa2_generalOptions').style.display = 'block';
}
function pp_sa2CloseGeneralOptions(save){
    if(save){ window._ppSaGeneralOptSet = true; }
    document.getElementById('pp_sa2_generalOptions').style.display = 'none';
}
function pp_sa2ConfirmSave(){
    _hidePopupError('pp_err_filesaveas');
    const a = window._ppAns||{};

    const fileName = (document.getElementById('pp_sa2_fileName')||{}).value||'';
    const fileType = document.getElementById('pp_sa2_fileType').value;
    const pwOpen   = (document.getElementById('pp_sa2_pwOpen')||{}).value||'';
    const pwModify = (document.getElementById('pp_sa2_pwModify')||{}).value||'';

    let errors=[];
    if(a.correctFolder && window._ppSaSelectedFolder!==a.correctFolder) errors.push('Thư mục lưu→"'+a.correctFolder+'"');
    if(a.fileName !==undefined && fileName.trim()!==a.fileName) errors.push('File name→"'+a.fileName+'"');
    if(a.fileType && fileType!==a.fileType) errors.push('Save as type→'+a.fileType);
    if(a.passwordToOpen!==undefined || a.passwordToModify!==undefined){
        if(!window._ppSaGeneralOptSet){
            errors.push('Cần mở Tools → General Options và nhập mật khẩu');
        } else {
            if(a.passwordToOpen  !==undefined && pwOpen  !==a.passwordToOpen)   errors.push('Password to open→"'+a.passwordToOpen+'"');
            if(a.passwordToModify!==undefined && pwModify!==a.passwordToModify) errors.push('Password to modify→"'+a.passwordToModify+'"');
        }
    }

if(errors.length){_showPopupError('pp_err_filesaveas','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}


/* ============================================================
   51. POPUP SHAPE — CLICK PHẢI CHUỘT + ADD TEXT (dùng ảnh tĩnh + hotspot)
{ text:'Bước X. Nháy chuột phải vào Shape, chọn Add Text và nhập nội dung',
	img:'images/Ex1-p3-c7-th-buoc5-thushape.png',
  	imgResult:'images/Ex1-p3-c7-th-buoc5-thushape.png',
  	imgFinal:'images/Ex1-p3-c7-th-buoc5-thushape.png',
  	width:'100%', hotspot:{x:250,y:180,w:120,h:60},
	popupType: 'shape-add-text',
	popupAnswer: { insertText: 'Begin in October!', enableCut: false, enableCopy: false, enablePaste: true }},

//cho phép chọn - xóa VB mẫu, cho nhập mới(add text) và paste, 	//Có thể sử dung Answer thôi
popupType: 'shape-add-text',
popupAnswer: { 
  	sampleText: 'Your text here',      
  	insertText: 'Address: USA', 
	enableAddText: true,
  	enablePaste: true }},

  sampleText: 'Your text here',      // ← văn bản mẫu hiển thị sẵn, đổi tùy câu hỏi
//Thay đổi hình tên hình Shape, tọa độ, cho phép Paste giống nội dung Answer
   ============================================================
   Dùng cho các bước đã có ảnh tĩnh minh họa Shape/WordArt/Textbox đã vẽ xong.
  Học sinh phải CLICK PHẢI vào đúng vùng đó,chọn "Add Text" trong menu ngữ cảnh giả lập, rồi gõ đúng nội dung ngay
   giữa vùng đó — gõ đúng là tự động đóng popup.

============================================================ */
function openShapeAddTextPopup(step){
    const box = _createPopupShell('Microsoft Word - Shape - Textbox');
    const ans = step.popupAnswer || {};

window._ppAns = {
        insertText: ('insertText' in ans) ? ans.insertText : undefined,
        sampleText:  ('sampleText' in ans) ? ans.sampleText : undefined,   /* ← MỚI: văn bản mẫu có sẵn, không cố định theo câu hỏi */
        enableCut:   ans.enableCut   === true,
        enableCopy:  ans.enableCopy  === true,
        enablePaste: ans.enablePaste === true,
    };
    window._ppShapeConfirmed = false;
    window._ppShapeHasSample = !!(window._ppAns.sampleText);
    window._ppShapeSampleDeleted = false;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:520px;gap:0;padding:0;font-family:Arial,sans-serif;';

    /* Hint bar */
    const hintBar = document.createElement('div');
    hintBar.style.cssText = 'font-size:14px;color:#6b7280;background:#f9fafb;'
        +'border-bottom:1px solid #e5e7eb;padding:6px 10px;';
    hintBar.innerHTML = window._ppShapeHasSample
        ? '👉 <b>Click trái</b> để chọn văn bản mẫu (Delete để xóa), hoặc <b>Click phải</b> để Add Text/Paste đè lên.'
        : '👉 <b>Click phải chuột</b> vào Shape, chọn <b style="color:#2563eb;">Add Text</b>, rồi nhập nội dung.';
    body.appendChild(hintBar);

    /* Vùng ảnh + hotspot */
    const imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'position:relative;background:#fff;overflow:hidden;';

    const img = document.createElement('img');
    img.src = step.img || step.imgResult || '';
    img.style.cssText = 'width:100%;height:auto;display:block;user-select:none;';
    imgWrap.appendChild(img);

    const hotspotEl = document.createElement('div');
    hotspotEl.id = 'pp_shape_hotspot';
    hotspotEl.style.cssText = 'position:absolute;cursor:context-menu;'
        +'border:2px dashed transparent;transition:border 0.15s;box-sizing:border-box;';
    imgWrap.appendChild(hotspotEl);
    body.appendChild(imgWrap);

function positionHotspot(){
        const nw = img.naturalWidth, nh = img.naturalHeight;
        const hs = step.hotspot || {x:180,y:180,w:220,h:80};
        if(!nw || !nh){ return; }
        hotspotEl.style.left   = (hs.x / nw * 100) + '%';
        hotspotEl.style.top    = (hs.y / nh * 100) + '%';
        hotspotEl.style.width  = (hs.w / nw * 100) + '%';
        hotspotEl.style.height = (hs.h / nh * 100) + '%';
    }
    if(img.complete && img.naturalWidth){ positionHotspot(); }
    else{ img.addEventListener('load', positionHotspot); }

    /* ── MỚI: hiện văn bản mẫu có sẵn (bôi đen như đã chọn), nếu câu hỏi khai báo sampleText ── */
    if(window._ppShapeHasSample){
        hotspotEl.style.display = 'flex';
        hotspotEl.style.alignItems = 'center';
        hotspotEl.style.justifyContent = 'center';
        hotspotEl.innerHTML = '<span style="background:rgba(59,130,246,0.35);padding:1px 4px;'
            +'font-size:18px;color:Red;white-space:nowrap;">'+window._ppAns.sampleText+'</span>';
    }

    var _ppDebug = (typeof debugMode !== 'undefined' && debugMode);

    hotspotEl.addEventListener('mouseenter', function(){
        if(!window._ppShapeConfirmed && !_ppDebug){ hotspotEl.style.border = '2px dashed #93c5fd'; }
    });
    hotspotEl.addEventListener('mouseleave', function(){
        if(!window._ppShapeConfirmed && !_ppDebug){ hotspotEl.style.border = '2px dashed transparent'; }
    });

    /* Click trái vào vùng hotspot:
       - Nếu còn văn bản mẫu chưa xóa → coi như "chọn" văn bản mẫu, hiện nút Delete.
       - Nếu không có mẫu (hoặc đã xóa) → giữ hành vi cũ: nhắc phải click phải. */
    hotspotEl.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        if(_ppDebug || window._ppShapeConfirmed){ return; }
        if(window._ppShapeHasSample && !window._ppShapeSampleDeleted){
            _pp_shapeSelectSample(hotspotEl);
            return;
        }
        _showPopupError('pp_err_shape', '❌ Cần <b>click phải chuột</b> vào Shape, không phải click trái.');
    });

    /* Click phải vào vùng hotspot → hiện menu ngữ cảnh giả lập (bỏ qua khi đang debug) */
    hotspotEl.addEventListener('contextmenu', function(e){
        e.preventDefault(); e.stopPropagation();
        if(_ppDebug || window._ppShapeConfirmed){ return; }
        _hidePopupError('pp_err_shape');
        _pp_shapeShowContextMenu(hotspotEl, imgWrap);
    });

    /* ── MỚI: Chế độ debug — kéo-thả chỉnh tọa độ hotspot, dùng chung khung #coordBox ── */
    if(_ppDebug){
        hotspotEl.classList.add('debug');
        hotspotEl.style.border = '2px dashed red';
        hotspotEl.style.background = 'rgba(255,0,0,0.15)';
        hotspotEl.style.cursor = 'move';

        function _ppShapeUpdateCoordBox(){
            const cbox = document.getElementById('coordBox');
            if(!cbox){ return; }
            const hs = step.hotspot;
            cbox.style.display = 'block';
            cbox.innerHTML = 'x: '+Math.round(hs.x)+'<br>y: '+Math.round(hs.y)+'<br>width: '+hs.w+'<br>height: '+hs.h
                +'<br><button type="button" onclick="_pp_shapeCenterHotspot()" style="margin-top:8px;padding:6px 14px;background:#f59e0b;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">🎯 Đưa về giữa khung</button>';
        }
        _ppShapeUpdateCoordBox();

        window._pp_shapeCenterHotspot = function(){
            const nw = img.naturalWidth, nh = img.naturalHeight;
            if(!nw || !nh){ return; }
            step.hotspot.x = Math.round((nw - step.hotspot.w) / 2);
            step.hotspot.y = Math.round((nh - step.hotspot.h) / 2);
            positionHotspot();
            _ppShapeUpdateCoordBox();
        };

        let _ppDragging = false, _ppStartX = 0, _ppStartY = 0;
        hotspotEl.addEventListener('mousedown', function(e){
            _ppDragging = true; _ppStartX = e.clientX; _ppStartY = e.clientY; e.preventDefault();
        });
        document.addEventListener('mousemove', function(e){
            if(!_ppDragging){ return; }
            const nw = img.naturalWidth, nh = img.naturalHeight;
            const dispW = img.offsetWidth, dispH = img.offsetHeight;
            if(!nw || !nh || !dispW || !dispH){ return; }
            step.hotspot.x += (e.clientX - _ppStartX) * (nw / dispW);
            step.hotspot.y += (e.clientY - _ppStartY) * (nh / dispH);
            positionHotspot();
            _ppShapeUpdateCoordBox();
            _ppStartX = e.clientX; _ppStartY = e.clientY;
        });
        document.addEventListener('mouseup', function(){ _ppDragging = false; });
    } else {
        const cboxOff = document.getElementById('coordBox');
        if(cboxOff){ cboxOff.style.display = 'none'; }
    }


    /* Error */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_shape';
    errDiv.style.margin = '8px 14px 0';
    body.appendChild(errDiv);

    /* Cancel */
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;padding:8px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    box.appendChild(body);
    box.style.width = '100%';
    box.style.maxWidth = 'none';
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '0';
}

/* ── Menu ngữ cảnh giả lập: Add Text (hoạt động) + Cut/Copy/Paste ── */
function _pp_shapeShowContextMenu(hotspotEl, imgWrap){
    const old = document.getElementById('pp_shape_ctxmenu');
    if(old){ old.remove(); }

    const rect = hotspotEl.getBoundingClientRect();

    const menu = document.createElement('div');
    menu.id = 'pp_shape_ctxmenu';
    menu.style.cssText = 'position:fixed;left:'+rect.left+'px;top:'+(rect.bottom+2)+'px;'
        +'background:#fff;border:1px solid #94a3b8;border-radius:4px;'
        +'box-shadow:0 4px 14px rgba(0,0,0,0.25);z-index:99999;min-width:150px;font-size:14px;overflow:visible;';

    const a = window._ppAns || {};
    const items = [
        { label:'Add Text', active:true,         action:'addtext' },
        { label:'Cut',      active:a.enableCut,   action:'cut'     },
        { label:'Copy',     active:a.enableCopy,  action:'copy'    },
        { label:'Paste',    active:a.enablePaste, action:'paste'   },
    ];
    items.forEach(function(it){
        const row = document.createElement('div');
        row.textContent = it.label;
        row.style.cssText = 'padding:7px 14px;'
            +(it.active ? 'cursor:pointer;color:#1e3a5f;' : 'cursor:not-allowed;color:#c1c7cf;');
        if(it.active){
            row.addEventListener('mouseenter', function(){ row.style.background='#eff6ff'; });
            row.addEventListener('mouseleave', function(){ row.style.background=''; });
            row.addEventListener('click', function(e){
                e.stopPropagation();
                menu.remove();
                document.removeEventListener('click', _pp_shapeCloseMenuOnOutsideClick);
                if(it.action === 'addtext'){
                    _pp_shapeActivateAddText(hotspotEl, false);
                } else if(it.action === 'paste'){
                    _pp_shapeActivateAddText(hotspotEl, true);
                }
            });
        }
        menu.appendChild(row);
    });

    document.body.appendChild(menu);

    /* Đóng menu khi click ra ngoài */
    setTimeout(function(){
        document.addEventListener('click', _pp_shapeCloseMenuOnOutsideClick);
    }, 0);
}

function _pp_shapeCloseMenuOnOutsideClick(e){
    const menu = document.getElementById('pp_shape_ctxmenu');
    if(menu && !menu.contains(e.target)){
        menu.remove();
        document.removeEventListener('click', _pp_shapeCloseMenuOnOutsideClick);
    }
}

/* ── Click trái chọn văn bản mẫu → hiện nút Delete ĐỒNG THỜI cho phép bấm phím Delete/Backspace ── */
function _pp_shapeSelectSample(hotspotEl){
    _hidePopupError('pp_err_shape');
    hotspotEl.style.border = '2px solid #2563eb';

    const old = document.getElementById('pp_shape_deleteBar');
    if(old){ old.remove(); }

    const bar = document.createElement('div');
    bar.id = 'pp_shape_deleteBar';
    const rect = hotspotEl.getBoundingClientRect();
    bar.style.cssText = 'position:fixed;left:'+rect.left+'px;top:'+(rect.bottom+4)+'px;'
        +'z-index:99999;background:#fff;border:1px solid #94a3b8;border-radius:4px;'
        +'box-shadow:0 4px 14px rgba(0,0,0,0.25);padding:6px 10px;'
        +'display:flex;align-items:center;gap:8px;font-size:14px;';
    bar.innerHTML = '<span style="color:#374151;">Đã chọn văn bản mẫu (Bấm Delete hoặc nút bên)</span>'
        +'<button type="button" style="padding:4px 12px;background:#dc2626;color:#fff;border:none;'
        +'border-radius:4px;font-weight:bold;cursor:pointer;">🗑 Delete</button>';

    // Hàm thực hiện xóa văn bản mẫu và chuyển sang chế độ gõ trực tiếp
    function _doDeleteSample(){
        window._ppShapeSampleDeleted = true;
        if(bar) bar.remove();
        document.removeEventListener('click', _pp_shapeCloseDeleteBarOutside);
        document.removeEventListener('keydown', _pp_handleSampleKeyDown);
        
        // TỰ ĐỘNG BẬT Ô NHẬP LIỆU ĐỂ GÕ TRỰC TIẾP
        _pp_shapeActivateAddText(hotspotEl, false);
    }

    // Lắng nghe phím Delete/Backspace từ bàn phím
    function _pp_handleSampleKeyDown(e){
        if(e.key === 'Delete' || e.key === 'Backspace'){
            e.preventDefault();
            _doDeleteSample();
        }
    }
    document.addEventListener('keydown', _pp_handleSampleKeyDown);

    bar.querySelector('button').addEventListener('click', function(e){
        e.stopPropagation();
        _doDeleteSample();
    });

    document.body.appendChild(bar);
    setTimeout(function(){ document.addEventListener('click', _pp_shapeCloseDeleteBarOutside); }, 0);
}

function _pp_shapeCloseDeleteBarOutside(e){
    const bar = document.getElementById('pp_shape_deleteBar');
    if(bar && !bar.contains(e.target) && e.target.id !== 'pp_shape_hotspot'){
        bar.remove();
        document.removeEventListener('click', _pp_shapeCloseDeleteBarOutside);
    }
}

/* ── Kích hoạt ô nhập liệu (cho phép cả GÕ TRỰC TIẾP và PASTE) ── */
function _pp_shapeActivateAddText(hotspotEl, autoFill){
    const a = window._ppAns || {};
    hotspotEl.style.border = '2px solid #2563eb';
    hotspotEl.style.display = 'flex';
    hotspotEl.style.alignItems = 'center';
    hotspotEl.style.justifyContent = 'center';
    
    // Nếu ô nhập chưa tồn tại thì mới tạo mới
    if(!document.getElementById('pp_shape_textInput')){
        hotspotEl.innerHTML = '<input type="text" id="pp_shape_textInput" placeholder="Nhập nội dung..."'
            +' style="width:92%;text-align:center;padding:2px 4px;border:none;border-bottom:2px solid #2563eb;'
            +'background:rgba(255,255,255,0.9);font-size:14px;color:#1e3a5f;font-weight:bold;outline:none;">';
    }

    const inp = document.getElementById('pp_shape_textInput');
    if(!inp){ return; }

    inp.addEventListener('click', function(e){ e.stopPropagation(); });
    inp.addEventListener('contextmenu', function(e){ e.stopPropagation(); });

    function _pp_shapeValidateInput(){
        _hidePopupError('pp_err_shape');
        if(window._ppShapeConfirmed){ return; }
        const val = inp.value.trim();
        if(a.insertText !== undefined && val === a.insertText){
            window._ppShapeConfirmed = true;
            setTimeout(function(){ closeMosPopup(); checkCorrect(); }, 400);
        }
    }
    inp.addEventListener('input', _pp_shapeValidateInput);

    if(autoFill && a.insertText !== undefined){
        /* Mô phỏng thao tác Paste */
        inp.value = '(Đã dán nội dung)';
        inp.readOnly = true;
        window._ppShapeConfirmed = true;
        setTimeout(function(){ closeMosPopup(); checkCorrect(); }, 400);
    } else {
        /* Focus vào ô để gõ trực tiếp ngay lập tức */
        setTimeout(function(){ 
            inp.focus(); 
            inp.select();
        }, 50);
    }
}
/* ============================================================
   52. POPUP WORD OPTIONS — SAVE (File → Options → Save) //chưa test
popupType: 'save-options',
popupAnswer: { 
	autoRecoverEnabled: true, 
	autoRecoverMinutes: 5, 
	defaultLocation: 'Desktop', 
	checkedOutTo: 'serverDrafts' }},
   ============================================================
popupType: 'save-options',
popupAnswer: {
  saveFormat:            'Word Document (*.docx)',
  keepLastAutoSaved:     true,
  autoRecoverEnabled:    true,
  autoRecoverMinutes:    5,
  hideBackstage:         false,
  showAdditionalPlaces:  false,
  saveToComputerDefault: true,
  defaultLocation:       'Desktop',            // 'Desktop'|'Documents'|'Downloads'
  checkedOutTo:          'serverDrafts',       // 'serverDrafts'|'officeCache'
}
Chỉ khai báo field cần kiểm tra — bỏ qua field không khai báo.
============================================================ */
/* ── Giá trị hiển thị mặc định khi MỞ popup — CỐ ĐỊNH, không đọc từ ans (tránh lộ đáp án) ── */
const _SV_DEFAULTS = {
    saveFormat: 'Word Document (*.docx)',
    keepLastAutoSaved: true,
    autoRecoverEnabled: true,
    autoRecoverMinutes: 10,
    hideBackstage: false,
    showAdditionalPlaces: true,
    saveToComputerDefault: false,
    defaultLocation: '',
    checkedOutTo: 'serverDrafts',
};
var _SV_FOLDERS = ['Desktop','Documents','Downloads'];

function openSaveOptionsPopup(step){
    const box = _createPopupShell('Word Options — Save');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        saveFormat:            ('saveFormat'            in ans) ? ans.saveFormat            : undefined,
        keepLastAutoSaved:     ('keepLastAutoSaved'     in ans) ? ans.keepLastAutoSaved     : undefined,
        autoRecoverEnabled:    ('autoRecoverEnabled'    in ans) ? ans.autoRecoverEnabled    : undefined,
        autoRecoverMinutes:    ('autoRecoverMinutes'    in ans) ? ans.autoRecoverMinutes    : undefined,
        hideBackstage:         ('hideBackstage'         in ans) ? ans.hideBackstage         : undefined,
        showAdditionalPlaces:  ('showAdditionalPlaces'  in ans) ? ans.showAdditionalPlaces  : undefined,
        saveToComputerDefault: ('saveToComputerDefault' in ans) ? ans.saveToComputerDefault : undefined,
        defaultLocation:       ('defaultLocation'       in ans) ? ans.defaultLocation       : undefined,
        checkedOutTo:          ('checkedOutTo'          in ans) ? ans.checkedOutTo          : undefined,
    };

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:480px;max-width:560px;gap:0;padding:0;font-size:14px;';

    const content = document.createElement('div');
    content.style.cssText = 'padding:14px 16px;max-height:65vh;overflow-y:auto;display:flex;flex-direction:column;gap:4px;';
    body.appendChild(content);

    /* ── Nhóm: Save documents ── */
    content.appendChild(_svSection('Save documents'));

    const fmtRow = document.createElement('div');
    fmtRow.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;margin-bottom:6px;';
    fmtRow.innerHTML = '<label>Save files in this format:</label>'
        +'<select id="pp_sv_format">'
        +'<option value="Word Document (*.docx)">Word Document (*.docx)</option>'
        +'<option value="Word 97-2003 Document (*.doc)">Word 97-2003 Document (*.doc)</option>'
        +'<option value="PDF (*.pdf)">PDF (*.pdf)</option>'
        +'<option value="Rich Text Format (*.rtf)">Rich Text Format (*.rtf)</option>'
        +'<option value="Plain Text (*.txt)">Plain Text (*.txt)</option>'
        +'</select>';
    content.appendChild(fmtRow);

    content.appendChild(_svCheckbox('pp_sv_keepLast', 'Keep the last autosaved version if I close without saving'));

    /* AutoRecover — checkbox + ô số phút (chỉ mở khóa khi tick) */
    const arRow = document.createElement('div');
    arRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:2px 0;';
    arRow.innerHTML = `
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
            <input type="checkbox" id="pp_sv_autoRecover" onchange="pp_svToggleAutoRecover()">
            Save AutoRecover information every
        </label>
        <input type="number" id="pp_sv_autoRecoverMin" min="1" max="120" value="10"
            style="width:55px;padding:3px 5px;border:1px solid #94a3b8;border-radius:3px;text-align:center;">
        <div style="display:flex;flex-direction:column;gap:1px;">
            <button type="button" onclick="pp_svStepMinutes(1)"
                style="width:18px;height:13px;font-size:9px;padding:0;border:1px solid #94a3b8;border-radius:2px;background:#f1f5f9;cursor:pointer;line-height:1;">▲</button>
            <button type="button" onclick="pp_svStepMinutes(-1)"
                style="width:18px;height:13px;font-size:9px;padding:0;border:1px solid #94a3b8;border-radius:2px;background:#f1f5f9;cursor:pointer;line-height:1;">▼</button>
        </div>
        <span>minutes</span>`;
    content.appendChild(arRow);

    content.appendChild(_svCheckbox('pp_sv_hideBackstage', "Don't show the Backstage when opening or saving files"));
    content.appendChild(_svCheckbox('pp_sv_showAdditional', 'Show additional places for saving, even if sign-in may be required'));
    content.appendChild(_svCheckbox('pp_sv_saveToComputer', 'Save to Computer by default'));

    /* Default local file location + Browse */
    const locRow = document.createElement('div');
    locRow.style.cssText = 'display:grid;grid-template-columns:auto 1fr auto;gap:6px;align-items:center;margin:6px 0;position:relative;';
    locRow.innerHTML = `
        <label style="white-space:nowrap;">Default local file location:</label>
        <input type="text" id="pp_sv_location" readonly placeholder="Chưa chọn thư mục..."
            style="padding:4px 6px;border:1px solid #94a3b8;border-radius:3px;background:#f8fafc;color:#374151;">
        <button type="button" class="pp-btn" style="padding:4px 12px;" onclick="pp_svToggleBrowse()">Browse...</button>
        <div id="pp_sv_browsePanel" style="display:none;position:absolute;top:100%;right:0;left:110px;
            background:#fff;border:1px solid #94a3b8;border-radius:4px;box-shadow:0 6px 16px rgba(0,0,0,0.18);z-index:30;">
        </div>`;
    content.appendChild(locRow);

    /* ── Nhóm: Save checked-out files to (2 mục chọn 1) ── */
    content.appendChild(_svSection('Save checked-out files to'));
    const ckWrap = document.createElement('div');
    ckWrap.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-bottom:4px;';
    ckWrap.innerHTML = `
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="radio" name="pp_sv_checkedOutTo" value="serverDrafts">
            The server drafts location on this computer
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="radio" name="pp_sv_checkedOutTo" value="officeCache">
            The Office Document Cache
        </label>`;
    content.appendChild(ckWrap);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_saveoptions';
    errDiv.style.margin = '6px 0 0';
    content.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:10px 16px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = `
        <button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>
        <button class="pp-btn pp-btn-ok" onclick="checkSaveOptionsPopup()">OK</button>`;
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
    body.querySelectorAll('label,input,select,button').forEach(function(el){ el.style.fontSize = '14px'; });

    /* Giá trị hiển thị mặc định — LUÔN dùng _SV_DEFAULTS, KHÔNG đọc từ ans (tránh lộ đáp án) */
    setTimeout(function(){
        document.getElementById('pp_sv_format').value = _SV_DEFAULTS.saveFormat;
        document.getElementById('pp_sv_keepLast').checked = _SV_DEFAULTS.keepLastAutoSaved;
        document.getElementById('pp_sv_autoRecover').checked = _SV_DEFAULTS.autoRecoverEnabled;
        document.getElementById('pp_sv_autoRecoverMin').value = _SV_DEFAULTS.autoRecoverMinutes;
        document.getElementById('pp_sv_hideBackstage').checked = _SV_DEFAULTS.hideBackstage;
        document.getElementById('pp_sv_showAdditional').checked = _SV_DEFAULTS.showAdditionalPlaces;
        document.getElementById('pp_sv_saveToComputer').checked = _SV_DEFAULTS.saveToComputerDefault;
        document.getElementById('pp_sv_location').value = _SV_DEFAULTS.defaultLocation;
        pp_svToggleAutoRecover();
        window._ppSvSelectedFolder = _SV_DEFAULTS.defaultLocation || null;
    }, 0);
}

function _svSection(title){
    const d = document.createElement('div');
    d.style.cssText = 'font-size:14px;font-weight:bold;color:#1e3a5f;margin:8px 0 4px;'
        +'padding:5px 8px;background:#eff6ff;border-left:4px solid #2563eb;border-radius:3px;';
    d.textContent = title;
    return d;
}
function _svCheckbox(id, label){
    const row = document.createElement('label');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;cursor:pointer;margin:2px 0;';
    row.innerHTML = '<input type="checkbox" id="'+id+'"> '+label;
    return row;
}

function pp_svToggleAutoRecover(){
    const chk = document.getElementById('pp_sv_autoRecover');
    const inp = document.getElementById('pp_sv_autoRecoverMin');
    if(!chk||!inp){return;}
    inp.disabled = !chk.checked;
    inp.style.opacity = chk.checked ? '1' : '0.5';
}
function pp_svStepMinutes(delta){
    const inp = document.getElementById('pp_sv_autoRecoverMin');
    if(!inp||inp.disabled){return;}
    const v = parseInt(inp.value)||10;
    inp.value = Math.max(1, Math.min(120, v+delta));
}

/* Browse: chỉ liệt kê 3 thư mục cố định, click chọn 1 cái để gán vào ô location */
function pp_svToggleBrowse(){
    const panel = document.getElementById('pp_sv_browsePanel');
    if(!panel){return;}
    const isOpen = panel.style.display === 'block';
    if(isOpen){ panel.style.display='none'; return; }

    panel.innerHTML = '';
    _SV_FOLDERS.forEach(function(fd){
        const row = document.createElement('div');
        row.textContent = '📁 '+fd;
        row.style.cssText = 'padding:7px 12px;cursor:pointer;font-size:14px;color:#374151;';
        row.addEventListener('mouseenter', function(){ row.style.background='#eff6ff'; });
        row.addEventListener('mouseleave', function(){ row.style.background=''; });
        row.addEventListener('click', function(){
            window._ppSvSelectedFolder = fd;
            document.getElementById('pp_sv_location').value = fd;
            panel.style.display = 'none';
            _hidePopupError('pp_err_saveoptions');
        });
        panel.appendChild(row);
    });
    panel.style.display = 'block';
}

function checkSaveOptionsPopup(){
    _hidePopupError('pp_err_saveoptions');
    const a = window._ppAns||{};

    const saveFormat  = document.getElementById('pp_sv_format').value;
    const keepLast    = document.getElementById('pp_sv_keepLast').checked;
    const arEnabled   = document.getElementById('pp_sv_autoRecover').checked;
    const arMinutes   = parseInt(document.getElementById('pp_sv_autoRecoverMin').value)||0;
    const hideBs      = document.getElementById('pp_sv_hideBackstage').checked;
    const showAdd     = document.getElementById('pp_sv_showAdditional').checked;
    const saveToComp  = document.getElementById('pp_sv_saveToComputer').checked;
    const location    = window._ppSvSelectedFolder || '';
    const ckEl        = document.querySelector('input[name="pp_sv_checkedOutTo"]:checked');
    const checkedOutTo= ckEl ? ckEl.value : '';

    let errors=[];
    if(a.saveFormat            && saveFormat !==a.saveFormat)             errors.push('Save format→'+a.saveFormat);
    if(a.keepLastAutoSaved     !==undefined&&keepLast   !==a.keepLastAutoSaved)  errors.push('Keep last autosaved→'+a.keepLastAutoSaved);
    if(a.autoRecoverEnabled    !==undefined&&arEnabled  !==a.autoRecoverEnabled) errors.push('AutoRecover→'+a.autoRecoverEnabled);
    if(a.autoRecoverMinutes    !==undefined && a.autoRecoverEnabled===true){
        if(isNaN(arMinutes)||arMinutes!==a.autoRecoverMinutes) errors.push('AutoRecover minutes→'+a.autoRecoverMinutes);
    }
    if(a.hideBackstage         !==undefined&&hideBs     !==a.hideBackstage)      errors.push('Hide Backstage→'+a.hideBackstage);
    if(a.showAdditionalPlaces  !==undefined&&showAdd    !==a.showAdditionalPlaces) errors.push('Show additional places→'+a.showAdditionalPlaces);
    if(a.saveToComputerDefault !==undefined&&saveToComp !==a.saveToComputerDefault) errors.push('Save to Computer by default→'+a.saveToComputerDefault);
    if(a.defaultLocation       && location !==a.defaultLocation)          errors.push('Default location→'+a.defaultLocation);
    if(a.checkedOutTo          && checkedOutTo !==a.checkedOutTo)         errors.push('Checked-out files to→'+a.checkedOutTo);

    if(errors.length){_showPopupError('pp_err_saveoptions','❌ Chưa đúng! '+errors.join(' | '));return;}
    closeMosPopup(); checkCorrect();
}


/* ============================================================
   53. POPUP OBJECT CONTEXT MENU — click phải Table/Shape/Picture...
//Click phải -> menu, Click phải -> menu + nội dung		//thiếu font color
popupType: 'object-context-menu',
popupAnswer: {
    	menuItems: ['Insert', 'Delete Cells', 'Table Properties', 'Borders and Shading...'],
    	menuItem: 'Table Properties' }},

popupType: 'object-context-menu',
popupAnswer: {
    	styleName: 'Heading 1',
    	menuItems: ['Update Heading 1 to Match Selection','Modify...','Select All 3 Instance(s)','Rename...','Remove from Style Gallery'],
    	menuItem: 'Modify...',
    	nextPopup: {
        	popupType: 'create-style',
        	popupAnswer: {
            		styleName: 'Heading 1',lockName: true,font: 'Arial',size: 16,fontColor: 'Red',bold: true,alignment: 'Left'}
    		}
	}},
	
============================================================ */

function openObjectContextMenuPopup(step){
    const box = _createPopupShell('Microsoft Word');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        menuItem:  ('menuItem'  in ans) ? ans.menuItem  : undefined,
        menuItems: Array.isArray(ans.menuItems) ? ans.menuItems : undefined,
        nextPopup: ('nextPopup' in ans) ? ans.nextPopup : undefined
    };
    window._ppOcmConfirmed = false;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:520px;gap:0;padding:0;font-family:Arial,sans-serif;';

    const hintBar = document.createElement('div');
    hintBar.style.cssText = 'font-size:14px;color:#6b7280;background:#f9fafb;'
        +'border-bottom:1px solid #e5e7eb;padding:6px 10px;';
    hintBar.innerHTML = '👉 <b>Click phải chuột</b> vào đối tượng, chọn đúng lệnh theo yêu cầu.';
    body.appendChild(hintBar);

    const imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'position:relative;background:#fff;overflow:hidden;';
    const img = document.createElement('img');
    img.src = step.img || step.imgResult || '';
    img.style.cssText = 'width:100%;height:auto;display:block;user-select:none;';
    imgWrap.appendChild(img);

    const hotspotEl = document.createElement('div');
    hotspotEl.id = 'pp_ocm_hotspot';
    hotspotEl.style.cssText = 'position:absolute;cursor:context-menu;'
        +'border:2px dashed transparent;transition:border 0.15s;box-sizing:border-box;';
    imgWrap.appendChild(hotspotEl);
    body.appendChild(imgWrap);

    function positionHotspot(){
        const nw = img.naturalWidth, nh = img.naturalHeight;
        const hs = step.hotspot || {x:0,y:0,w:60,h:40};
        if(!nw || !nh){ return; }
        hotspotEl.style.left   = (hs.x / nw * 100) + '%';
        hotspotEl.style.top    = (hs.y / nh * 100) + '%';
        hotspotEl.style.width  = (hs.w / nw * 100) + '%';
        hotspotEl.style.height = (hs.h / nh * 100) + '%';
    }
    if(img.complete && img.naturalWidth){ positionHotspot(); }
    else{ img.addEventListener('load', positionHotspot); }

    var _ocmDebug = (typeof debugMode !== 'undefined' && debugMode);

    hotspotEl.addEventListener('mouseenter', function(){
        if(!window._ppOcmConfirmed && !_ocmDebug){ hotspotEl.style.border = '2px dashed #93c5fd'; }
    });
    hotspotEl.addEventListener('mouseleave', function(){
        if(!window._ppOcmConfirmed && !_ocmDebug){ hotspotEl.style.border = '2px dashed transparent'; }
    });
    hotspotEl.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        if(_ocmDebug || window._ppOcmConfirmed){ return; }
        _showPopupError('pp_err_ocm', '❌ Cần <b>click phải chuột</b> vào đối tượng, không phải click trái.');
    });
    hotspotEl.addEventListener('contextmenu', function(e){
        e.preventDefault(); e.stopPropagation();
        if(_ocmDebug || window._ppOcmConfirmed){ return; }
        _hidePopupError('pp_err_ocm');
        _pp_ocmShowMenu(hotspotEl);
    });

    /* Chế độ debug — kéo-thả chỉnh tọa độ (giống popup 51) */
    if(_ocmDebug){
        hotspotEl.classList.add('debug');
        hotspotEl.style.border = '2px dashed red';
        hotspotEl.style.background = 'rgba(255,0,0,0.15)';
        hotspotEl.style.cursor = 'move';
        function _ocmUpdateCoordBox(){
            const cbox = document.getElementById('coordBox');
            if(!cbox){ return; }
            const hs = step.hotspot;
            cbox.style.display = 'block';
            cbox.innerHTML = 'x: '+Math.round(hs.x)+'<br>y: '+Math.round(hs.y)+'<br>width: '+hs.w+'<br>height: '+hs.h
                +'<br><button type="button" onclick="_pp_ocmCenterHotspot()" style="margin-top:8px;padding:6px 14px;background:#f59e0b;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">🎯 Đưa về giữa khung</button>';
        }
        _ocmUpdateCoordBox();
        window._pp_ocmCenterHotspot = function(){
            const nw = img.naturalWidth, nh = img.naturalHeight;
            if(!nw || !nh){ return; }
            step.hotspot.x = Math.round((nw - step.hotspot.w) / 2);
            step.hotspot.y = Math.round((nh - step.hotspot.h) / 2);
            positionHotspot(); _ocmUpdateCoordBox();
        };
        let _ocmDragging=false, _ocmSX=0, _ocmSY=0;
        hotspotEl.addEventListener('mousedown', function(e){ _ocmDragging=true; _ocmSX=e.clientX; _ocmSY=e.clientY; e.preventDefault(); });
        document.addEventListener('mousemove', function(e){
            if(!_ocmDragging){ return; }
            const nw=img.naturalWidth, nh=nh=img.naturalHeight, dispW=img.offsetWidth, dispH=img.offsetHeight;
            if(!nw||!nh||!dispW||!dispH){ return; }
            step.hotspot.x += (e.clientX-_ocmSX) * (nw/dispW);
            step.hotspot.y += (e.clientY-_ocmSY) * (nh/dispH);
            positionHotspot(); _ocmUpdateCoordBox();
            _ocmSX=e.clientX; _ocmSY=e.clientY;
        });
        document.addEventListener('mouseup', function(){ _ocmDragging=false; });
    } else {
        const cboxOff = document.getElementById('coordBox');
        if(cboxOff){ cboxOff.style.display = 'none'; }
    }

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_ocm';
    errDiv.style.margin = '8px 14px 0';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;padding:8px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    box.appendChild(body);
    box.style.width = '100%';
    box.style.maxWidth = 'none';
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '0';
}

function _pp_ocmShowMenu(hotspotEl){
    const old = document.getElementById('pp_ocm_ctxmenu');
    if(old){ old.remove(); }

    const menu = document.createElement('div');
    menu.id = 'pp_ocm_ctxmenu';
    menu.style.cssText =
        'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);'
        +'background:#fff;border:1px solid #94a3b8;border-radius:4px;'
        +'box-shadow:0 4px 14px rgba(0,0,0,0.25);'
        +'z-index:99999;min-width:180px;font-size:14px;';

    const items = (window._ppAns && Array.isArray(window._ppAns.menuItems) && window._ppAns.menuItems.length)
        ? window._ppAns.menuItems
        : ['Hyperlink','Edit Hyperlink','Remove Hyperlink','Text Direction','Table Properties'];

    items.forEach(function(label){
        const row = document.createElement('div');
        row.textContent = label;
        row.style.cssText = 'padding:7px 14px;cursor:pointer;color:#1e3a5f;border-bottom:1px solid #f1f5f9;';
        row.addEventListener('mouseenter', function(){ row.style.background='#eff6ff'; });
        row.addEventListener('mouseleave', function(){ row.style.background=''; });
        row.addEventListener('click', function(e){
            e.stopPropagation();
            menu.remove();
            document.removeEventListener('click', _pp_ocmCloseMenuOutside);
            _pp_ocmHandlePick(label, hotspotEl);
        });
        menu.appendChild(row);
    });
    document.body.appendChild(menu);
    setTimeout(function(){ document.addEventListener('click', _pp_ocmCloseMenuOutside); }, 0);
}

function _pp_ocmCloseMenuOutside(e){
    const menu = document.getElementById('pp_ocm_ctxmenu');
    if(menu && !menu.contains(e.target)){
        menu.remove();
        document.removeEventListener('click', _pp_ocmCloseMenuOutside);
    }
}

function _pp_ocmHandlePick(label, hotspotEl){
    _hidePopupError('pp_err_ocm');
    const a = window._ppAns || {};
    if(a.menuItem && label !== a.menuItem){
        _showPopupError('pp_err_ocm', '❌ Sai! Yêu cầu chọn: <b>'+a.menuItem+'</b>');
        return;
    }
    window._ppOcmConfirmed = true;
    hotspotEl.style.border = '2px solid #16a34a';
    setTimeout(function(){
        closeMosPopup();
        if(a.nextPopup && a.nextPopup.popupType){
            
            // 🟢 ĐOẠN ĐƯỢC CẬP NHẬT: Tự động ép tên Style và khóa ô Name khi mở popup liên kết
            const nextData = Object.assign({}, a.nextPopup.popupAnswer || {});
            
            // Mở popup kế tiếp và tự động gán tên vào ô pp_cs_name
            openMosPopup({ 
                popupType: a.nextPopup.popupType, 
                popupAnswer: nextData 
            });

// Gán trực tiếp tên Style vào ô Name ngay khi popup mới vừa mở ra
            setTimeout(function(){
                const nameEl = document.getElementById('pp_cs_name');
                if (nameEl) {
                    nameEl.value = nextData.styleName || 'Heading 1';
                    nameEl.readOnly = true;
                    nameEl.style.background = '#f1f5f9';
                    nameEl.style.color = '#475569';
                    nameEl.style.cursor = 'not-allowed';
                }

                // 🟢 THÊM MỚI ĐOẠN NÀY: Chọn sẵn Font mặc định (Thay 'Arial' bằng tên font anh muốn)
                const fontEl = document.getElementById('pp_cs_font');
                if (fontEl) {
                    fontEl.value = nextData.font || 'Arial'; 
                }
            }, 50);

        } else {
            checkCorrect();
        }
    }, 400);
}
/* ============================================================
   54. POPUP TEXT DIRECTION — 3 khung hướng chữ + nhập text
{ text:'Bước X+1. Chọn hướng chữ và nhập nội dung',
imgFinal:'images/...-th-buockq.png', width:'100%',
popupType: 'text-direction',
popupAnswer: {
	orientation: 'RotateUp', insertText: 'Begin in October!' }},
   ============================================================
   Mô phỏng hộp thoại Text Direction thật của Word: 3 khung xem trước
   (Horizontal / Xoay lên / Xoay xuống). Chọn ĐÚNG khung theo Answer →
   hiện ô nhập text ngay trong khung đó → gõ đúng nội dung là tự đóng.
   Chọn SAI khung → báo lỗi, không hiện ô nhập.

popupType: 'text-direction',
popupAnswer: { orientation: 'RotateUp', insertText: 'Begin in October!' }
   // orientation: 'Horizontal' | 'RotateUp' | 'RotateDown'
============================================================ */
function openTextDirectionPopup(step){
    const box = _createPopupShell('Text Direction — Table Cell');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        orientation: ('orientation' in ans) ? ans.orientation : undefined,
        insertText:  ('insertText'  in ans) ? ans.insertText  : undefined,
    };
    window._ppTdSelected  = null;
    window._ppTdConfirmed = false;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:440px;gap:0;padding:14px 16px;display:flex;flex-direction:column;gap:10px;';

    const label = document.createElement('div');
    label.style.cssText = 'font-size:14px;font-weight:bold;color:#1e3a5f;';
    label.textContent = 'Orientation';
    body.appendChild(label);

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:14px;justify-content:center;';

    const options = [
        { key:'Horizontal', label:'Horizontal', rotate:'0deg' },
        { key:'RotateUp',   label:'Xoay lên',    rotate:'-90deg' },
        { key:'RotateDown', label:'Xoay xuống',  rotate:'90deg' },
    ];
    options.forEach(function(opt){
        const cell = document.createElement('div');
        cell.id = 'pp_td_box_'+opt.key;
        cell.dataset.key = opt.key;
        cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;'
            +'padding:10px;border:2px solid #e2e8f0;border-radius:6px;cursor:pointer;'
            +'background:#f8fafc;min-width:90px;min-height:90px;justify-content:center;transition:all 0.15s;';
        cell.innerHTML = '<div style="width:60px;height:50px;border:1px solid #cbd5e1;background:#fff;'
            +'display:flex;align-items:center;justify-content:center;overflow:hidden;">'
            +'<span style="font-size:13px;color:#374151;transform:rotate('+opt.rotate+');white-space:nowrap;">Text</span>'
            +'</div><span style="font-size:12px;color:#64748b;">'+opt.label+'</span>';
        cell.addEventListener('mouseenter', function(){ if(!window._ppTdConfirmed) cell.style.borderColor='#93c5fd'; });
        cell.addEventListener('mouseleave', function(){ if(!window._ppTdConfirmed && window._ppTdSelected!==opt.key) cell.style.borderColor='#e2e8f0'; });
        cell.addEventListener('click', function(){ _pp_tdSelect(opt.key, cell); });
        row.appendChild(cell);
    });
    body.appendChild(row);

    /* Vùng nhập text — hiện sau khi chọn đúng khung */
    const inputWrap = document.createElement('div');
    inputWrap.id = 'pp_td_inputWrap';
    inputWrap.style.cssText = 'display:none;flex-direction:column;gap:4px;';
    inputWrap.innerHTML = '<label style="font-size:14px;color:#1e3a5f;">Nhập nội dung:</label>'
        +'<input type="text" id="pp_td_textInput" placeholder="Nhập nội dung..."'
        +' style="padding:6px 8px;border:1px solid #94a3b8;border-radius:3px;font-size:14px;">';
    body.appendChild(inputWrap);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_td';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.className = 'pp-btn-row';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    box.appendChild(body);
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '10px';
}

function _pp_tdSelect(key, cellEl){
    if(window._ppTdConfirmed){ return; }
    _hidePopupError('pp_err_td');
    const a = window._ppAns || {};

    ['Horizontal','RotateUp','RotateDown'].forEach(function(k){
        const el = document.getElementById('pp_td_box_'+k);
        if(el){ el.style.borderColor = '#e2e8f0'; el.style.background = '#f8fafc'; }
    });

    if(a.orientation && key !== a.orientation){
        cellEl.style.borderColor = '#dc2626';
        cellEl.style.background  = 'rgba(220,38,38,0.06)';
        _showPopupError('pp_err_td', '❌ Sai! Chưa đúng hướng chữ theo yêu cầu.');
        document.getElementById('pp_td_inputWrap').style.display = 'none';
        return;
    }

    window._ppTdSelected = key;
    cellEl.style.borderColor = '#2563eb';
    cellEl.style.background  = 'rgba(37,99,235,0.08)';

    const wrap = document.getElementById('pp_td_inputWrap');
    const inp  = document.getElementById('pp_td_textInput');
    if(!wrap || !inp){ return; }
    wrap.style.display = 'flex';
    inp.value = '';
    setTimeout(function(){ inp.focus(); }, 30);

    if(inp._ppBound){ return; }
    inp._ppBound = true;
    inp.addEventListener('input', function(){
        _hidePopupError('pp_err_td');
        if(window._ppTdConfirmed){ return; }
        const val = inp.value.trim();

        if(a.insertText !== undefined && val === a.insertText){
            window._ppTdConfirmed = true;
            setTimeout(function(){ closeMosPopup(); checkCorrect(); }, 400);
        }
    });
}


/* ============================================================
   56. POPUP PICTURE CLICK — T9 (FIX TẮT/MỞ DEBUG & DỌN DẸP EVENT)
popupType: 'picture-click',
popupAnswer: {
    	midImage: 'images/Highlight.png',
    	stage1Label: 'nhóm Font',
   	stage2Label: 'lệnh',
    	rightClickStage1: true,
	menuWidth: '',
       	hotspots: [
           { x: 2, y: 2, w: 26, h: 26, label: 'Turquoise' },
           { x: 2, y: 32, w: 26, h: 26, label: 'Red' },
           { x: 62, y: 1, w: 26, h: 26, label: 'Dark Yellow' }
       		],
    	correctIndex: 0 }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Highlight.png',
	stage1Label: 'nhóm Highlight',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 2, y: 2, w: 26, h: 26, label: 'Turquoise' },
           { x: 2, y: 32, w: 26, h: 26, label: 'Red' },
           { x: 62, y: 1, w: 26, h: 26, label: 'Dark Yellow' }
       		],
       correctIndex: 0   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Linespacing.png',
	stage1Label: 'nhóm Line and ... spacing',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 0, y: 69, w: 157, h: 25, label: '' },
           { x: 0, y: 94, w: 157, h: 25, label: '' },
           { x: 0, y: 142, w: 157, h: 25, label: '' }
       		],
       correctIndex: 2   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Pagecolor.png',
	stage1Label: 'nhóm Pagecolor',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 84, y: 136, w: 15, h: 15, label: 'Green' },
           { x: 152, y: 136, w: 15, h: 15, label: 'Dark Blue' },
           { x: -1, y: 136, w: 15, h: 15, label: 'Dark Red' }
       		],
       correctIndex: 1   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Wordart.png',
	stage1Label: 'nhóm Wordart',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 226, y: 4, w: 42, h: 42, label: 'Gold Fill,..Soft Bevel' },
           { x: 0, y: 3, w: 42, h: 42, label: 'Fill Black,..Shadow' },
           { x: 57, y: 58, w: 42, h: 42, label: 'Gradient Fiil,..Reflection' }
       		],
       correctIndex: 0   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Styletable.png',
	stage1Label: 'nhóm Styletable',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 153, y: 324, w: 62, h: 62, label: 'Grid Table 5 Dark - Accent 2' },
           { x: 293, y: 324, w: 62, h: 62, label: 'Grid Table 5 Dark - Accent 4' },
           { x: 295, y: 19, w: 62, h: 62, label: 'Plain Table 3' }
       		],
       correctIndex: 0   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Themes.png',
	stage1Label: 'nhóm Themes',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 153, y: 324, w: 62, h: 62, label: 'Organic' },
           { x: 293, y: 324, w: 62, h: 62, label: 'Office' },
           { x: 295, y: 19, w: 62, h: 62, label: 'Banded' }
       		],
       correctIndex: 0   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Watermark.png',
	stage1Label: 'nhóm Watermark',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 8, y: 16, w: 74, h: 104, label: '' },
           { x: 191, y: 17, w: 73, h: 104, label: '' },
           { x: 0, y: 265, w: 156, h: 22, label: 'Custom Watermark' }
       		],
       correctIndex: 2   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Styletext.png',
	stage1Label: 'nhóm Styletext',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 153, y: 324, w: 62, h: 62, label: 'Intense Emphasis' },
           { x: 293, y: 324, w: 62, h: 62, label: 'Title' },
           { x: 295, y: 19, w: 62, h: 62, label: 'Heading 1' }
       		],
       correctIndex: 0   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Styledocument.png',
	stage1Label: 'nhóm Styledocument',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 153, y: 324, w: 62, h: 62, label: 'Shaded' },
           { x: 293, y: 324, w: 62, h: 62, label: 'Basic simple' },
           { x: 295, y: 19, w: 62, h: 62, label: 'Centered' }
       		],
       correctIndex: 0   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Find.png',
	stage1Label: 'nhóm Find',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 0, y: -1, w: 122, h: 21, label: '' },
           { x: 0, y: 23, w: 122, h: 21, label: '' },
           { x: 0, y: 48, w: 122, h: 21, label: '' }
       		],
       correctIndex: 2   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Bullet.png',
	stage1Label: 'nhóm Bullet',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 0, y: 188, w: 150, h: 26, label: '' },
           { x: 0, y: 216, w: 150, h: 26, label: '' }
        		],
       correctIndex: 1   }},

popupType: 'picture-click',
popupAnswer: {
	midImage: 'images/Changecase.png',
	stage1Label: 'nhóm Changecase',
	stage2Label: 'lệnh',
	menuWidth: '',
       	hotspots: [
           { x: 0, y: 0, w: 101, h: 21, label: '' },
           { x: 0, y: 23, w: 101, h: 23, label: '' },
           { x: 0, y: 49, w: 101, h: 23, label: '' }
       		],
       correctIndex: 2   }},
   ============================================================ */

function openFontColorT9Popup(step){

    const box = _createPopupShell('Microsoft Word');
    const ans = step.popupAnswer || {};

window._ppT9Ans = {
        midImage: ans.midImage || '',
        hotspots: Array.isArray(ans.hotspots) ? ans.hotspots : [],
        correctIndex: (typeof ans.correctIndex === 'number') ? ans.correctIndex : 0,
        stage1Label: ans.stage1Label || 'Font Color',
        stage2Label: ans.stage2Label || 'màu',
        rightClickStage1: ans.rightClickStage1 === true,
        // 🟢 SỬA DÒNG NÀY: Nếu menuWidth rỗng ('') hoặc không khai báo -> tự động lấy 'auto'
        menuWidth: (ans.menuWidth && ans.menuWidth.trim() !== '') ? ans.menuWidth : 'auto'
    };

    window._ppT9Confirmed = false;
    window._ppT9Stage1Done = false;

    // Lấy trạng thái Debug mode hiện tại
    let _t9Debug = (typeof debugMode !== 'undefined' && debugMode);

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:520px;gap:0;padding:0;font-family:Arial,sans-serif;overflow-y:auto;max-height:80vh;';

    /* HINT BAR */
    const hintBar = document.createElement('div');
    hintBar.style.cssText = 'font-size:14px;color:#6b7280;background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:8px 12px;position:sticky;top:0;z-index:30;';
    body.appendChild(hintBar);

    function updateHintBarText(){
        const lbl1 = window._ppT9Ans.stage1Label;
        const lbl2 = window._ppT9Ans.stage2Label;
        const isRightClick = window._ppT9Ans.rightClickStage1;
        if(_t9Debug){
            hintBar.innerHTML = '🛠️ <b>DEBUG MODE:</b> Kéo giữ ô để di chuyển, kéo nút góc để đổi kích thước.';
        } else if(window._ppT9Stage1Done){
            hintBar.innerHTML = '';
        } else if(isRightClick){
            hintBar.innerHTML = '👉 <b>Click chuột phải</b> vào đúng vị trí '+lbl1+'.';
        } else {
            hintBar.innerHTML = '';
        }
    }
    updateHintBarText();

    /* STAGE 1 - ẢNH GỐC */
    const stage1 = document.createElement('div');
    stage1.id = 'pp_t9_stage1';
    stage1.style.cssText = 'position:relative;background:#fff;overflow:visible;margin:0 auto;width:100%;';
    body.appendChild(stage1);

    const img1 = document.createElement('img');
    img1.src = step.img || step.imgResult || '';
    img1.style.cssText = 'width:100%;height:auto;display:block;user-select:none;';
    stage1.appendChild(img1);

    /* HOTSPOT TẦNG 1 */
    const hs1 = document.createElement('div');
    hs1.id = 'pp_t9_hs1';
    hs1.style.cssText = 'position:absolute;box-sizing:border-box;transition:border 0.15s;z-index:5;';
    stage1.appendChild(hs1);

    const hs1ResizeHandle = document.createElement('div');
    hs1ResizeHandle.className = 'resize-handle-hs1';
    hs1ResizeHandle.style.cssText = 'position:absolute;right:-4px;bottom:-4px;width:8px;height:8px;background:#ef4444;border:1px solid #fff;cursor:se-resize;z-index:30;display:none;';
    hs1.appendChild(hs1ResizeHandle);

    function positionHotspot1(){
        const nw = img1.naturalWidth;
        const nh = img1.naturalHeight;
        const hs = step.hotspot || {x:0,y:0,w:60,h:40};

        if(!nw || !nh) return;

        hs1.style.left = (hs.x / nw * 100) + '%';
        hs1.style.top = (hs.y / nh * 100) + '%';
        hs1.style.width = (hs.w / nw * 100) + '%';
        hs1.style.height = (hs.h / nh * 100) + '%';
    }

    if(img1.complete && img1.naturalWidth){
        positionHotspot1();
    } else {
        img1.addEventListener('load', positionHotspot1);
    }

/* STAGE 2 - BẢNG MÀU TẦNG 2 */
    const stage2 = document.createElement('div');
    stage2.id = 'pp_t9_stage2';
    
    // 🟢 SỬA: Tính độ rộng vừa khít ảnh (auto) hoặc theo cấu hình menuWidth trong Answer
    const customWidth = window._ppT9Ans.menuWidth;
    const widthCss = (customWidth === 'auto') ? 'width:auto;max-width:70%;' : ('width:' + customWidth + ';');
    stage2.style.cssText = 'display:none;position:absolute;z-index:20;' + widthCss + 'height:auto;background:#fff;margin:0;padding:0;box-sizing:border-box;box-shadow:0 4px 16px rgba(0,0,0,0.3);border:1px solid #cbd5e1;';
    stage1.appendChild(stage2);

    const stage2Inner = document.createElement('div');
    stage2Inner.style.cssText = 'position:relative;width:100%;height:100%;display:block;';
    stage2.appendChild(stage2Inner);

    const img2 = document.createElement('img');
    img2.src = window._ppT9Ans.midImage;
    img2.style.cssText = 'width:100%;height:auto;display:block;user-select:none;';
    stage2Inner.appendChild(img2);

    /* 3 HOTSPOT MÀU TẦNG 2 */
    const t9Hotspots = [];
    for(let i = 0; i < window._ppT9Ans.hotspots.length; i++){
        const hsData = window._ppT9Ans.hotspots[i];
        if(!hsData) continue;

        const hs = document.createElement('div');
        hs.id = 'pp_t9_color_hs_' + i;
        hs.dataset.index = i;
        hs.style.cssText = 'position:absolute;box-sizing:border-box;z-index:25;';
        stage2Inner.appendChild(hs);

        const rHandle = document.createElement('div');
        rHandle.className = 'resize-handle-hs2';
        rHandle.style.cssText = 'position:absolute;right:-4px;bottom:-4px;width:8px;height:8px;background:#ef4444;border:1px solid #fff;cursor:se-resize;z-index:30;display:none;';
        hs.appendChild(rHandle);

        t9Hotspots.push({ el: hs, data: hsData, index: i, resizeHandle: rHandle });
    }

    function positionColorHotspots(){
        const nw = img2.naturalWidth;
        const nh = img2.naturalHeight;
        if(!nw || !nh) return;

        t9Hotspots.forEach(function(item){
            const hs = item.data;
            const el = item.el;
            el.style.left = (hs.x / nw * 100) + '%';
            el.style.top = (hs.y / nh * 100) + '%';
            el.style.width = (hs.w / nw * 100) + '%';
            el.style.height = (hs.h / nh * 100) + '%';
        });
    }

    if(img2.complete && img2.naturalWidth){
        positionColorHotspots();
    } else {
        img2.addEventListener('load', positionColorHotspots);
    }

    /* TOOLTIP HIỂN THỊ TÊN MÀU ĐỘNG */
    const tooltip = document.createElement('div');
    tooltip.id = 'pp_t9_tooltip';
    tooltip.style.cssText = 'display:none;position:absolute;z-index:100;pointer-events:none;background:#111827;color:#fff;padding:6px 10px;border-radius:4px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
    stage2Inner.appendChild(tooltip);

    function showT9Tooltip(label, el){
        if(!label || _t9Debug) return;
        tooltip.textContent = label;
        tooltip.style.display = 'block';

        const rect = stage2Inner.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        let x = (elRect.left - rect.left) + (elRect.width / 2) - (tooltip.offsetWidth / 2);
        let y = (elRect.bottom - rect.top) + 6;

        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    function hideT9Tooltip(){
        tooltip.style.display = 'none';
    }

    /* TÍNH VỊ TRÍ STAGE 2 */
    function positionStage2(){
        const hs = step.hotspot || {x:0,y:0,w:60,h:40};
        const nw = img1.naturalWidth;
        const nh = img1.naturalHeight;

        if(!nw || !nh || !stage2.offsetWidth) return;

        const displayW = img1.offsetWidth;
        const displayH = img1.offsetHeight;

        const hsLeft = hs.x / nw * displayW;
        const hsTop = hs.y / nh * displayH;
        const hsHeight = hs.h / nh * displayH;

        let left = hsLeft;
        if(left + stage2.offsetWidth > displayW){
            left = displayW - stage2.offsetWidth - 10;
        }

        const top = hsTop + hsHeight + 4;

        stage2.style.left = left + 'px';
        stage2.style.top = top + 'px';
    }

    /* EVENT CLICK/CLICK-PHẢI HOTSPOT TẦNG 1 — loại sự kiện tùy theo rightClickStage1 */
    function _t9HandleStage1Trigger(e){
        if(window._ppT9Ans.rightClickStage1){ e.preventDefault(); }
        if(_t9Debug || window._ppT9Stage1Done) return;

        window._ppT9Stage1Done = true;
        hs1.style.border = '2px solid #16a34a';
        updateHintBarText();

        stage2.style.display = 'block';

        positionStage2();
        positionColorHotspots();
    }
    if(window._ppT9Ans.rightClickStage1){
        hs1.addEventListener('contextmenu', _t9HandleStage1Trigger);
        hs1.style.cursor = 'context-menu';
    } else {
        hs1.addEventListener('click', _t9HandleStage1Trigger);
    }

    /* EVENTS 3 HOTSPOT TẦNG 2 */
    t9Hotspots.forEach(function(item){
        const el = item.el;
        const hs = item.data;
        const index = item.index;

        el.addEventListener('mouseenter', function(e){
            if(window._ppT9Confirmed || _t9Debug) return;
            el.style.border = '2px solid #2563eb';
            el.style.background = 'rgba(37,99,235,0.2)';
            showT9Tooltip(hs.label, el);
        });

        el.addEventListener('mousemove', function(e){
            if(window._ppT9Confirmed || _t9Debug) return;
            showT9Tooltip(hs.label, el);
        });

        el.addEventListener('mouseleave', function(){
            if(!_t9Debug){
                el.style.border = '2px dashed transparent';
                el.style.background = 'transparent';
            }
            hideT9Tooltip();
        });

        el.addEventListener('click', function(e){
            if(_t9Debug || window._ppT9Confirmed) return;
            e.stopPropagation();

            hideT9Tooltip();

            if(index === window._ppT9Ans.correctIndex){
                window._ppT9Confirmed = true;
                el.style.border = '2px solid #16a34a';
                el.style.background = 'rgba(22,163,74,0.2)';

                setTimeout(function(){
                    closeMosPopup();
                    checkCorrect();
                }, 400);
            } else {
                _showPopupError('pp_err_t9', '❌ Sai! Hãy chọn đúng màu theo yêu cầu.');
            }
        });
    });

    /* ============================================================
       QUẢN LÝ BẬT / TẮT CHẾ ĐỘ DEBUG MODE & CLEANUP EVENT
       ============================================================ */

    let dragTarget = null;
    let startX = 0, startY = 0;

    function updateT9CoordBox(){
        const cbox = document.getElementById('coordBox');
        if(!cbox) return;

        if(!_t9Debug){
            cbox.style.display = 'none';
            return;
        }

        const hs1Data = step.hotspot || {x:0,y:0,w:60,h:40};
        let html = '<b>Hotspot 1 (Font Color)</b><br>x: ' + Math.round(hs1Data.x) + '<br>y: ' + Math.round(hs1Data.y) + '<br>w: ' + Math.round(hs1Data.w) + '<br>h: ' + Math.round(hs1Data.h);

        t9Hotspots.forEach(function(item){
            const hs = item.data;
            html += '<hr style="margin:6px 0;"><b>Hotspot ' + (item.index + 1) + ' (' + (hs.label || 'Color') + ')</b><br>x: ' + Math.round(hs.x) + '<br>y: ' + Math.round(hs.y) + '<br>w: ' + Math.round(hs.w) + '<br>h: ' + Math.round(hs.h);
        });

        cbox.style.display = 'block';
        cbox.innerHTML = html;
    }

    // Hàm cập nhật giao diện khi BẬT / TẮT Debug Mode
    function applyDebugStyles(){
        updateHintBarText();

        if(_t9Debug){
            // Hiển thị dạng Debug
            hs1.style.border = '2px dashed red';
            hs1.style.background = 'rgba(255,0,0,0.15)';
            hs1.style.cursor = 'move';
            hs1ResizeHandle.style.display = 'block';

            stage2.style.display = 'block'; // Trong Debug luôn mở tầng 2 để chỉnh

            t9Hotspots.forEach(item => {
                item.el.style.border = '2px dashed red';
                item.el.style.background = 'rgba(255,0,0,0.15)';
                item.el.style.cursor = 'move';
                item.resizeHandle.style.display = 'block';
            });
        } else {
            // Hiển thị bình thường (Học viên)
            hs1.style.border = window._ppT9Stage1Done ? '2px solid #16a34a' : '2px dashed transparent';
            hs1.style.background = 'transparent';
            hs1.style.cursor = 'pointer';
            hs1ResizeHandle.style.display = 'none';

            stage2.style.display = window._ppT9Stage1Done ? 'block' : 'none';

            t9Hotspots.forEach(item => {
                item.el.style.border = '2px dashed transparent';
                item.el.style.background = 'transparent';
                item.el.style.cursor = 'pointer';
                item.resizeHandle.style.display = 'none';
            });
        }

        updateT9CoordBox();
    }

    // LẮNG NGHE KÉO MOUSE KHI ĐANG DEBUG
    hs1.addEventListener('mousedown', function(e){
        if(!_t9Debug) return;
        dragTarget = (e.target === hs1ResizeHandle) ? 'hs1_resize' : 'hs1_move';
        startX = e.clientX;
        startY = e.clientY;
        e.preventDefault();
    });

    t9Hotspots.forEach(function(item){
        item.el.addEventListener('mousedown', function(e){
            if(!_t9Debug) return;
            dragTarget = (e.target === item.resizeHandle) ? ('hs2_resize_' + item.index) : ('hs2_move_' + item.index);
            startX = e.clientX;
            startY = e.clientY;
            e.preventDefault();
            e.stopPropagation();
        });
    });

    function handleDebugMouseMove(e){
        if(!_t9Debug || !dragTarget) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if(dragTarget.startsWith('hs1')){
            const nw = img1.naturalWidth, nh = img1.naturalHeight;
            const dw = img1.offsetWidth, dh = img1.offsetHeight;
            if(nw && dw){
                const hs = step.hotspot;
                const scaleX = nw / dw;
                const scaleY = nh / dh;

                if(dragTarget === 'hs1_move'){
                    hs.x += dx * scaleX;
                    hs.y += dy * scaleY;
                } else {
                    hs.w = Math.max(10, hs.w + dx * scaleX);
                    hs.h = Math.max(10, hs.h + dy * scaleY);
                }
                positionHotspot1();
                positionStage2();
            }
        }

        if(dragTarget.startsWith('hs2')){
            const nw = img2.naturalWidth, nh = img2.naturalHeight;
            const dw = img2.offsetWidth, dh = img2.offsetHeight;
            if(nw && dw){
                const index = parseInt(dragTarget.split('_')[2]);
                const hsData = t9Hotspots[index].data;
                const scaleX = nw / dw;
                const scaleY = nh / dh;

                if(dragTarget.includes('move')){
                    hsData.x += dx * scaleX;
                    hsData.y += dy * scaleY;
                } else {
                    hsData.w = Math.max(10, hsData.w + dx * scaleX);
                    hsData.h = Math.max(10, hsData.h + dy * scaleY);
                }
                positionColorHotspots();
            }
        }

        updateT9CoordBox();
        startX = e.clientX;
        startY = e.clientY;
    }

    function handleDebugMouseUp(){
        dragTarget = null;
    }

    // Đăng ký EventListener toàn cục
    window.addEventListener('mousemove', handleDebugMouseMove);
    window.addEventListener('mouseup', handleDebugMouseUp);

    // BẬT HÀM CUNG CẤP CHO NÚT TOGGLE NGOÀI WEB ĐỂ BẬT/TẮT DEBUG NGAY TRỰC TIẾP
    window._toggleT9DebugMode = function(isEnable){
        _t9Debug = (typeof isEnable === 'boolean') ? isEnable : !debugMode;
        applyDebugStyles();
        if(_t9Debug){
            positionStage2();
            positionColorHotspots();
        }
    };

    // CLEANUP LỚP LẮNG NGHE KHI ĐÓNG POPUP (TRÁNH LỖI KẸT SỰ KIỆN)
    const originalCloseMosPopup = window.closeMosPopup;
    window.closeMosPopup = function(){
        window.removeEventListener('mousemove', handleDebugMouseMove);
        window.removeEventListener('mouseup', handleDebugMouseUp);
        const cbox = document.getElementById('coordBox');
        if(cbox) cbox.style.display = 'none';
        
        if(typeof originalCloseMosPopup === 'function'){
            originalCloseMosPopup();
        }
    };

    /* FOOTER & CONTAINER */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_t9';
    errDiv.style.margin = '8px 14px 0';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;padding:8px 14px;border-top:1px solid #e2e8f0;margin-top:10px;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    box.appendChild(body);
    box.style.setProperty('width', '100%', 'important');
    box.style.setProperty('max-width', 'none', 'important');
    const overlay = box.closest('.mos-popup-overlay');
    if(overlay){
        overlay.style.cssText = 'display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:0;width:100%;';
    }
    const sim0T9 = document.getElementById('simulator0');
    if(sim0T9 && sim0T9.clientWidth){
        box.style.setProperty('width', sim0T9.clientWidth + 'px', 'important');
    }
    requestAnimationFrame(function(){
        positionHotspot1();
        positionColorHotspots();
        applyDebugStyles();
        if(sim0T9 && sim0T9.clientWidth){
            box.style.setProperty('width', sim0T9.clientWidth + 'px', 'important');
        }
    });
}


/* ============================================================
   57. POPUP REMOVE BACKGROUND (SỬA LỖI TRẮNG KHUNG & KHÔNG SANG CÂU)
   ============================================================ */
function openRemoveBackgroundPopup(step) {
    const box = _createPopupShell('Background Removal — Microsoft Word');
    const ans = step.popupAnswer || {};

    // 1. Đọc vị trí khung đáp án đúng & dung sai
    const targetBox = {
        x: (typeof ans.targetX === 'number') ? ans.targetX : (ans.targetHotspot ? ans.targetHotspot.x : 100),
        y: (typeof ans.targetY === 'number') ? ans.targetY : (ans.targetHotspot ? ans.targetHotspot.y : 100),
        w: (typeof ans.targetW === 'number') ? ans.targetW : (ans.targetHotspot ? ans.targetHotspot.w : 200),
        h: (typeof ans.targetH === 'number') ? ans.targetH : (ans.targetHotspot ? ans.targetHotspot.h : 200)
    };
    const tolerance = (typeof ans.tolerance === 'number') ? ans.tolerance : 15;

    // 2. Vị trí khung khởi tạo ban đầu (chưa kéo)
    const initBox = ans.initialBox || { x: 40, y: 40, w: 180, h: 180 };
    window._ppRmbgCurrentBox = Object.assign({}, initBox);
    window._ppRmbgConfirmed = false;
    window._isRmbgDebugVisible = false;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:540px;gap:0;padding:0;font-family:Arial,sans-serif;display:flex;flex-direction:column;';

    /* THANH HƯỚNG DẪN */
    const topBar = document.createElement('div');
    topBar.style.cssText = 'font-size:13px;color:#374151;background:#f3f4f6;border-bottom:1px solid #d1d5db;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:30;';
    topBar.innerHTML = '<div>👉 <b>Hướng dẫn:</b> Rê chuột vào <b>giữa khung</b> để di chuyển, hoặc kéo <b>các góc vuông</b> để điều chỉnh vùng giữ lại.</div>';
    body.appendChild(topBar);

    /* VÙNG CHỨA ẢNH & LỚP TÍM */
    const stage = document.createElement('div');
    stage.id = 'pp_rmbg_stage';
    stage.style.cssText = 'position:relative;background:#e5e7eb;overflow:hidden;margin:0 auto;width:100%;user-select:none;';
    body.appendChild(stage);

    // 1. Ảnh gốc
    const img = document.createElement('img');
    img.src = step.img || step.imgResult || '';
    img.style.cssText = 'width:100%;height:auto;display:block;user-select:none;pointer-events:none;';
    stage.appendChild(img);

    // 2. Lớp phủ màu tím (Magenta Overlay)
    const purpleOverlay = document.createElement('div');
    purpleOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background-color:rgba(186,85,211,0.55);pointer-events:none;z-index:5;';
    stage.appendChild(purpleOverlay);

    // 3. Khung bao quanh (Keep Box)
    const keepBox = document.createElement('div');
    keepBox.style.cssText = 'position:absolute;border:2px dashed #000;box-shadow:0 0 0 1px #fff;cursor:move;box-sizing:border-box;z-index:10;';
    stage.appendChild(keepBox);

    // Tạo 8 điểm kéo
    const handlesData = [
        { key: 'tl', cursor: 'nwse-resize', css: 'top:-5px;left:-5px;' },
        { key: 'tr', cursor: 'nesw-resize', css: 'top:-5px;right:-5px;' },
        { key: 'bl', cursor: 'nesw-resize', css: 'bottom:-5px;left:-5px;' },
        { key: 'br', cursor: 'nwse-resize', css: 'bottom:-5px;right:-5px;' },
        { key: 'tm', cursor: 'ns-resize', css: 'top:-5px;left:calc(50% - 5px);' },
        { key: 'bm', cursor: 'ns-resize', css: 'bottom:-5px;left:calc(50% - 5px);' },
        { key: 'lm', cursor: 'ew-resize', css: 'top:calc(50% - 5px);left:-5px;' },
        { key: 'rm', cursor: 'ew-resize', css: 'top:calc(50% - 5px);right:-5px;' }
    ];

    handlesData.forEach(function(h) {
        const handleEl = document.createElement('div');
        handleEl.dataset.action = 'resize-' + h.key;
        handleEl.style.cssText = 'position:absolute;width:9px;height:9px;background:#000;border:1px solid #fff;box-sizing:border-box;z-index:15;cursor:' + h.cursor + ';' + h.css;
        keepBox.appendChild(handleEl);
    });

    /* HIỂN THỊ TỌA ĐỘ VÀ KHÓA RIÊNG KHUNG KÉO */
    function updateCoordBoxText() {
        const cur = window._ppRmbgCurrentBox;
        if (!cur) return;

        const roundX = Math.round(cur.x);
        const roundY = Math.round(cur.y);
        const roundW = Math.round(cur.w);
        const roundH = Math.round(cur.h);

        const htmlContent = '<b>[Tọa độ hiện tại]</b> x: <span style="color:#6ee7b7;">' + roundX 
            + '</span> | y: <span style="color:#6ee7b7;">' + roundY 
            + '</span> | w: <span style="color:#6ee7b7;">' + roundW 
            + '</span> | h: <span style="color:#6ee7b7;">' + roundH 
            + '</span> &nbsp;—&nbsp; <b>[Đáp án]</b> targetX: ' + targetBox.x + ', targetY: ' + targetBox.y + ', targetW: ' + targetBox.w + ', targetH: ' + targetBox.h;

        // Ẩn Mục 2 ngoài HTML chính để tránh tràn sang câu sau
        let mainCbox = document.getElementById('coordBox') || document.querySelector('.coord-box') || document.getElementById('mos_coord_box');
        if (mainCbox) {
            mainCbox.style.display = 'none';
            mainCbox.innerHTML = '';
        }

        // Hiện Mục 1 trong Popup
        let localCbox = document.getElementById('pp_rmbg_debug_box');
        if (!localCbox) {
            localCbox = document.createElement('div');
            localCbox.id = 'pp_rmbg_debug_box';
            localCbox.style.cssText = 'background:#111827;color:#fff;padding:8px 12px;font-size:12px;font-family:monospace;border-bottom:2px solid #ef4444;z-index:9999;text-align:center;';
            if (body && body.firstChild) {
                body.insertBefore(localCbox, body.firstChild);
            }
        }
        localCbox.innerHTML = htmlContent;
        localCbox.style.display = window._isRmbgDebugVisible ? 'block' : 'none';
    }

    /* VẼ LỚP TÍM VÀ VÙNG ĐỤC LỖ */
    function renderRmbgBox() {
        const nw = img.naturalWidth, nh = img.naturalHeight;
        const dw = img.offsetWidth, dh = img.offsetHeight;
        if (!nw || !dw || !nh || !dh) return;

        const cur = window._ppRmbgCurrentBox;

        const leftPct = (cur.x / nw * 100);
        const topPct = (cur.y / nh * 100);
        const widthPct = (cur.w / nw * 100);
        const heightPct = (cur.h / nh * 100);

        keepBox.style.left = leftPct + '%';
        keepBox.style.top = topPct + '%';
        keepBox.style.width = widthPct + '%';
        keepBox.style.height = heightPct + '%';

        const pxX = cur.x / nw * dw;
        const pxY = cur.y / nh * dh;
        const pxW = cur.w / nw * dw;
        const pxH = cur.h / nh * dh;
        const pxX2 = pxX + pxW;
        const pxY2 = pxY + pxH;

        purpleOverlay.style.clipPath = 'polygon('
            + '0px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 0px, '
            + pxX + 'px ' + pxY + 'px, '
            + pxX + 'px ' + pxY2 + 'px, '
            + pxX2 + 'px ' + pxY2 + 'px, '
            + pxX2 + 'px ' + pxY + 'px, '
            + pxX + 'px ' + pxY + 'px)';

        updateCoordBoxText();
    }

    if (img.complete && img.naturalWidth) {
        setTimeout(renderRmbgBox, 50);
    } else {
        img.addEventListener('load', renderRmbgBox);
    }

    /* KÉO THẢ DI CHUYỂN */
    let isDragging = false;
    let dragAction = null;
    let startX = 0, startY = 0;
    let startBox = {};

    function onMouseDown(e) {
        if (window._ppRmbgConfirmed) return;
        _hidePopupError('pp_err_rmbg');
        
        isDragging = true;
        dragAction = e.target.dataset.action || 'move';
        startX = e.clientX;
        startY = e.clientY;
        startBox = Object.assign({}, window._ppRmbgCurrentBox);

        e.preventDefault();
        e.stopPropagation();
    }

    function onMouseMove(e) {
        if (!isDragging || window._ppRmbgConfirmed) return;

        const nw = img.naturalWidth, nh = img.naturalHeight;
        const dw = img.offsetWidth, dh = img.offsetHeight;
        if (!nw || !dw || !nh || !dh) return;

        const scaleX = nw / dw;
        const scaleY = nh / dh;
        const dx = (e.clientX - startX) * scaleX;
        const dy = (e.clientY - startY) * scaleY;

        const cur = window._ppRmbgCurrentBox;

        if (dragAction === 'move') {
            cur.x = Math.max(0, Math.min(nw - startBox.w, startBox.x + dx));
            cur.y = Math.max(0, Math.min(nh - startBox.h, startBox.y + dy));
        } else {
            if (dragAction.includes('r')) cur.w = Math.max(20, Math.min(nw - startBox.x, startBox.w + dx));
            if (dragAction.includes('b')) cur.h = Math.max(20, Math.min(nh - startBox.y, startBox.h + dy));
            if (dragAction.includes('l')) {
                const newW = Math.max(20, startBox.w - dx);
                if (startBox.x + dx >= 0) {
                    cur.w = newW;
                    cur.x = startBox.x + dx;
                }
            }
            if (dragAction.includes('t')) {
                const newH = Math.max(20, startBox.h - dy);
                if (startBox.y + dy >= 0) {
                    cur.h = newH;
                    cur.y = startBox.y + dy;
                }
            }
        }

        renderRmbgBox();
    }

    function onMouseUp() {
        isDragging = false;
        dragAction = null;
    }

    keepBox.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    /* DỌN DẸP SẠCH SẼ KHI THOÁT POPUP */
    function cleanupRmbg() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        keepBox.removeEventListener('mousedown', onMouseDown);

        let mainCbox = document.getElementById('coordBox') || document.querySelector('.coord-box') || document.getElementById('mos_coord_box');
        if (mainCbox) {
            mainCbox.style.display = 'none';
            mainCbox.innerHTML = '';
        }

        let localCbox = document.getElementById('pp_rmbg_debug_box');
        if (localCbox) localCbox.remove();

        window._isRmbgDebugVisible = false;
    }

    box.dataset.hasCleanup = "true";
    box._cleanupPopup = cleanupRmbg;

    /* NÚT CHỨC NĂNG & THÔNG BÁO LỖI */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_rmbg';
    errDiv.style.margin = '8px 14px 0';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-top:1px solid #e5e7eb;margin-top:8px;background:#fafafa;';
    btnRow.innerHTML = '<div>'
        + '<button id="pp_rmbg_btnKeep" class="pp-btn" style="background:#16a34a;color:#fff;border:none;padding:6px 14px;font-weight:bold;border-radius:4px;cursor:pointer;position:relative;z-index:999;">✓ Keep Changes</button>'
        + '</div>'
        + '<div>'
        + '<button class="pp-btn pp-btn-cancel" id="pp_rmbg_btnDiscard" style="position:relative;z-index:999;">Discard All Changes</button>'
        + '</div>';
    body.appendChild(btnRow);

    /* XỬ LÝ SỰ KIỆN NÚT BẤM VÀ CHUYỂN BƯỚC */
    setTimeout(function() {
        const btnDiscard = document.getElementById('pp_rmbg_btnDiscard');
        if (btnDiscard) {
            btnDiscard.onclick = function() {
                cleanupRmbg();
                closeMosPopup();
            };
        }

        const btnKeep = document.getElementById('pp_rmbg_btnKeep');
        if (btnKeep) {
            btnKeep.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (window._ppRmbgConfirmed) return;

                const cur = window._ppRmbgCurrentBox;

                const diffX = Math.abs(cur.x - targetBox.x);
                const diffY = Math.abs(cur.y - targetBox.y);
                const diffW = Math.abs(cur.w - targetBox.w);
                const diffH = Math.abs(cur.h - targetBox.h);

                const isCorrect = (diffX <= tolerance && diffY <= tolerance && diffW <= tolerance && diffH <= tolerance);

                // Cho phép qua bước nếu kéo đúng vị trí hoặc đang mở chế độ Debug
                if (isCorrect || window._isRmbgDebugVisible) {
                    window._ppRmbgConfirmed = true;
                    btnKeep.style.background = '#15803d';
                    btnKeep.textContent = '✓ Correcting...';
                    
                    setTimeout(function() {
                        cleanupRmbg();
                        closeMosPopup();
                        
                        // Kích hoạt chấm điểm chuẩn để nhảy sang Câu 5
                        if (typeof checkCorrect === 'function') {
                            checkCorrect();
                        } else if (typeof nextStep === 'function') {
                            nextStep();
                        }
                    }, 250);
                } else {
                    _showPopupError('pp_err_rmbg', '❌ Sai! Vùng giữ lại chưa đúng kích thước hoặc vị trí yêu cầu.');
                }
            });
        }
    }, 50);

    box.appendChild(body);
    box.style.setProperty('width', '100%', 'important');
    box.style.setProperty('max-width', 'none', 'important');
    box.style.maxHeight = '85vh';
    box.style.display = 'flex';
    box.style.flexDirection = 'column';
    box.style.overflowY = 'auto';
    box.style.boxSizing = 'border-box';

    const overlay = box.closest('.mos-popup-overlay');
    if (overlay) {
        overlay.style.cssText = 'display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:0;width:100%;';
    }

    const sim0 = document.getElementById('simulator0');
    if (sim0 && sim0.clientWidth) {
        box.style.setProperty('width', sim0.clientWidth + 'px', 'important');
    }

    /* LẮP SỰ KIỆN CHO NÚT "KHUNG TỌA ĐỘ" */
    const debugBtn = Array.from(document.querySelectorAll('button, a, div, span')).find(el => el.textContent.includes('Khung tọa độ'));
    if (debugBtn) {
        debugBtn.onclick = function() {
            window._isRmbgDebugVisible = !window._isRmbgDebugVisible;
            updateCoordBoxText();
        };
    }

    updateCoordBoxText();
}
/* ============================================================
   58. POPUP MULTI-HOTSPOT — N điểm trên 1 ảnh tĩnh, không thứ tự
   popupType: 'multi-hotspot' 	//*chọn nhiều điểm ảnh tĩnh*
   ============================================================
   Dùng ảnh tĩnh step.img + NHIỀU vùng hotspot (2 hoặc 3, tùy độ dài
   mảng popupAnswer.hotspots). Học sinh click đủ HẾT các vùng đúng,
   không cần theo thứ tự. Click ngoài mọi vùng → báo lỗi (không lộ
   vị trí chính xác còn thiếu). Đủ hết → tự đóng popup.

popupType: 'multi-hotspot',
popupAnswer: {
  	hotspots: [
    	{ x:100, y:50, w:80, h:30, label:'Different First Page' },
    	{ x:200, y:50, w:60, h:30, label:'Next' },
    	{ x:300, y:50, w:70, h:30, label:'Close Header&Footer' }
  	]
	}},
============================================================ */
function openMultiHotspotPopup(step){
    const box = _createPopupShell('Microsoft Word');
    const ans = step.popupAnswer || {};

    const hotspots = Array.isArray(ans.hotspots) ? ans.hotspots : [];
    window._ppAns = { hotspots: hotspots };
    window._ppMhDone = new Array(hotspots.length).fill(false);
    window._ppMhConfirmed = false;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:520px;gap:0;padding:0;font-family:Arial,sans-serif;';

    const hintBar = document.createElement('div');
    hintBar.id = 'pp_mh_hint';
    hintBar.style.cssText = 'font-size:14px;color:#6b7280;background:#f9fafb;'
        +'border-bottom:1px solid #e5e7eb;padding:6px 10px;';
    function updateHint(){
        const doneCount = window._ppMhDone.filter(Boolean).length;
        hintBar.innerHTML = '👉 Click đủ các vị trí yêu cầu — '
            +'<b>Đã chọn: '+doneCount+'/'+hotspots.length+'</b>';
    }
    updateHint();
    body.appendChild(hintBar);

    const imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'position:relative;background:#fff;overflow:hidden;';
    const img = document.createElement('img');
    img.src = step.img || step.imgResult || '';
    img.style.cssText = 'width:100%;height:auto;display:block;user-select:none;';
    imgWrap.appendChild(img);

    /* Lớp phủ toàn ảnh — bắt "click sai" (ngoài mọi hotspot) */
    const clickLayer = document.createElement('div');
    clickLayer.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;cursor:pointer;';
    imgWrap.appendChild(clickLayer);
    clickLayer.addEventListener('click', function(e){
        e.stopPropagation();
        if(window._ppMhConfirmed || (typeof debugMode !== 'undefined' && debugMode)){ return; }
        _showPopupError('pp_err_mh', '❌ Sai vị trí! Vẫn còn '+(hotspots.length - window._ppMhDone.filter(Boolean).length)+' vị trí cần chọn đúng.');
    });

    var _mhDebug = (typeof debugMode !== 'undefined' && debugMode);
    const hsEls = [];

    function positionAll(){
        const nw = img.naturalWidth, nh = img.naturalHeight;
        if(!nw || !nh){ return; }
        hsEls.forEach(function(item){
            const hs = item.hs;
            hs.style.left   = (item.data.x / nw * 100) + '%';
            hs.style.top    = (item.data.y / nh * 100) + '%';
            hs.style.width  = (item.data.w / nw * 100) + '%';
            hs.style.height = (item.data.h / nh * 100) + '%';
        });
    }

    hotspots.forEach(function(hsData, idx){
        const hs = document.createElement('div');
        hs.id = 'pp_mh_hs_'+idx;
        hs.dataset.idx = idx;
        hs.style.cssText = 'position:absolute;cursor:pointer;z-index:10;'
            +'border:2px dashed transparent;transition:border 0.15s,background 0.15s;box-sizing:border-box;';

        imgWrap.appendChild(hs);

        const rHandle = document.createElement('div');
        rHandle.className = 'pp-mh-resize-handle';
        rHandle.style.cssText = 'position:absolute;right:-4px;bottom:-4px;width:9px;height:9px;'
            +'background:#dc2626;border:1px solid #fff;cursor:se-resize;z-index:20;display:none;';
        hs.appendChild(rHandle);

        hsEls.push({ hs:hs, data:hsData, resizeHandle:rHandle });

        hs.addEventListener('mouseenter', function(){
            if(!window._ppMhDone[idx] && !_mhDebug){ hs.style.border = '2px dashed #93c5fd'; }
        });
        hs.addEventListener('mouseleave', function(){
            if(!window._ppMhDone[idx] && !_mhDebug){ hs.style.border = '2px dashed transparent'; }
        });
        hs.addEventListener('click', function(e){
            e.preventDefault(); e.stopPropagation();
            if(_mhDebug || window._ppMhConfirmed){ return; }
            _hidePopupError('pp_err_mh');
            if(window._ppMhDone[idx]){ return; } /* đã xong rồi, bỏ qua */
            window._ppMhDone[idx] = true;
            hs.style.border = '2px solid #16a34a';
            hs.style.background = 'rgba(22,163,74,0.12)';
            updateHint();

            const allDone = window._ppMhDone.every(Boolean);
            if(allDone){
                window._ppMhConfirmed = true;
                hintBar.innerHTML = '✅ Đã chọn đủ tất cả vị trí!';
                setTimeout(function(){ closeMosPopup(); checkCorrect(); }, 500);
            }
        });
    });

    if(img.complete && img.naturalWidth){ positionAll(); }
    else{ img.addEventListener('load', positionAll); }

    body.appendChild(imgWrap);

    /* Debug — kéo-thả chỉnh tọa độ từng hotspot, dùng chung #coordBox */
    if(_mhDebug){
        hsEls.forEach(function(item, idx){
            const hs = item.hs, data = item.data, rHandle = item.resizeHandle;
            hs.classList.add('debug');
            hs.style.border = '2px dashed red';
            hs.style.background = 'rgba(255,0,0,0.15)';
            hs.style.cursor = 'move';
            if(rHandle){ rHandle.style.display = 'block'; }

            function updCoordBox(){
                const cbox = document.getElementById('coordBox');
                if(!cbox){ return; }
                cbox.style.display = 'block';
                cbox.innerHTML = '[Hotspot '+(idx+1)+' — '+(data.label||'')+']<br>'
                    +'x: '+Math.round(data.x)+'<br>y: '+Math.round(data.y)
                    +'<br>width: '+Math.round(data.w)+'<br>height: '+Math.round(data.h)
                    +'<br><button type="button" onclick="window._pp_mhCenter'+idx+'()" style="margin-top:6px;padding:5px 12px;background:#f59e0b;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">🎯 Đưa về giữa khung</button>';
            }
            hs.addEventListener('mouseenter', updCoordBox);

            window['_pp_mhCenter'+idx] = function(){
                const nw=img.naturalWidth, nh=img.naturalHeight;
                if(!nw||!nh){ return; }
                data.x = Math.round((nw - data.w) / 2);
                data.y = Math.round((nh - data.h) / 2);
                positionAll(); updCoordBox();
            };

            let dragMode=null, sx=0, sy=0;
            hs.addEventListener('mousedown', function(e){
                dragMode = (e.target===rHandle) ? 'resize' : 'move';
                sx=e.clientX; sy=e.clientY;
                e.preventDefault(); e.stopPropagation();
            });
            document.addEventListener('mousemove', function(e){
                if(!dragMode){ return; }
                const nw=img.naturalWidth, nh=img.naturalHeight, dw=img.offsetWidth, dh=img.offsetHeight;
                if(!nw||!nh||!dw||!dh){ return; }
                const dx=(e.clientX-sx) * (nw/dw);
                const dy=(e.clientY-sy) * (nh/dh);
                if(dragMode==='move'){
                    data.x += dx; data.y += dy;
                } else {
                    data.w = Math.max(10, data.w + dx);
                    data.h = Math.max(10, data.h + dy);
                }
                positionAll(); updCoordBox();
                sx=e.clientX; sy=e.clientY;
            });
            document.addEventListener('mouseup', function(){ dragMode=null; });
        });
    } else {
        const cboxOff = document.getElementById('coordBox');
        if(cboxOff){ cboxOff.style.display = 'none'; }
    }

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_mh';
    errDiv.style.margin = '8px 14px 0';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;padding:8px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    box.appendChild(body);
    box.style.width = '100%';
    box.style.maxWidth = 'none';
    box.closest('.mos-popup-overlay').style.alignItems = 'flex-start';
    box.closest('.mos-popup-overlay').style.overflowY  = 'auto';
    box.closest('.mos-popup-overlay').style.paddingTop = '0';
}

/* ============================================================
   59. POPUP MULTI-HOTSPOT WITH DROPDOWN MENU
	//*Nhiều hotspot + DROPDOWN
   ------------------------------------------------------------
   * Khai báo mẫu trong JSON bài tập:
     {
         text: 'Bước 3. Nháy chọn lệnh ... chứa thông tin tài liệu',
         img: 'images/test1-p7-c6-th-buoc3.png',
         imgResult: 'images/test1-p7-c6-da-buoc3.png',
         width: '100%',
         hotspot: { x: 4, y: 29, w: 100, h: 35 },
popupType: 'multi-hotspot-dropdown',
popupAnswer: {
	hotspots: [
             		{ x: 2, y: 31, w: 100, h: 35, label: 'Info' },
             		{ x: 146, y: 201, w: 80, h: 77, label: 'Inspect Document' }
         		],
         	dropdown: {
             		x: 230, y: 150, w: 200,         
             		correctIndex: 0,               
             		options: ['Inspect Document (All)','Check Accessibility','Check Compatibility']
		}
         }},
   ============================================================ */
function openMultiHotspotDropdownPopup(step) {
    const box = _createPopupShell('Microsoft Word');
    const ans = step.popupAnswer || {};

    const hotspots = Array.isArray(ans.hotspots) ? ans.hotspots : [];
    const dropdownConfig = ans.dropdown || null;

    window._ppAns59 = { hotspots: hotspots, dropdown: dropdownConfig };
    window._ppMh59Done = new Array(hotspots.length).fill(false);
    window._ppMh59Confirmed = false;

    var _mhDebug = (typeof debugMode !== 'undefined' && debugMode);

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:520px;gap:0;padding:0;font-family:Arial,sans-serif;display:flex;flex-direction:column;';

    /* THANH HƯỚNG DẪN */
    const hintBar = document.createElement('div');
    hintBar.id = 'pp_mh59_hint';
    hintBar.style.cssText = 'font-size:13px;color:#374151;background:#f3f4f6;border-bottom:1px solid #d1d5db;padding:8px 12px;';
    
    function updateHint() {
        const doneCount = window._ppMh59Done.filter(Boolean).length;
        hintBar.innerHTML = '👉 Click đủ các vị trí yêu cầu (không cần theo thứ tự) — '
            + '<b>Đã chọn: ' + doneCount + '/' + hotspots.length + '</b>';
    }
    updateHint();
    body.appendChild(hintBar);

    /* VÙNG CHỨA ẢNH & HOTSPOTS */
    const imgWrap = document.createElement('div');
    imgWrap.id = 'pp_mh59_img_wrap';
    imgWrap.style.cssText = 'position:relative;background:#fff;overflow:hidden;user-select:none;';
    
    const img = document.createElement('img');
    img.src = step.img || step.imgResult || '';
    img.style.cssText = 'width:100%;height:auto;display:block;user-select:none;';
    imgWrap.appendChild(img);

    /* Lớp phủ bắt click sai */
    const clickLayer = document.createElement('div');
    clickLayer.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;cursor:pointer;';
    imgWrap.appendChild(clickLayer);
    
    clickLayer.addEventListener('click', function(e) {
        e.stopPropagation();
        if (window._ppMh59Confirmed || _mhDebug) return;
        
        const remain = hotspots.length - window._ppMh59Done.filter(Boolean).length;
        if (remain > 0) {
            _showPopupError('pp_err_mh59', '❌ Sai vị trí! Vẫn còn ' + remain + ' vị trí cần chọn đúng.');
        }
    });

    const hsEls = [];

    /* ĐỊNH VỊ CÁC ELEMENT THEO TỶ LỆ % ẢNH (GIỮ NGUYÊN TỪ POPUP 58) */
    function positionAll() {
        const nw = img.naturalWidth, nh = img.naturalHeight;
        if (!nw || !nh) return;

        // Định vị Hotspots
        hsEls.forEach(function(item) {
            const hs = item.hs, data = item.data;
            hs.style.left   = (data.x / nw * 100) + '%';
            hs.style.top    = (data.y / nh * 100) + '%';
            hs.style.width  = (data.w / nw * 100) + '%';
            hs.style.height = (data.h / nh * 100) + '%';
        });

        // Định vị Menu Dropdown
        const ddEl = document.getElementById('pp_mh59_dropdown');
        if (ddEl && dropdownConfig) {
            ddEl.style.left  = (dropdownConfig.x / nw * 100) + '%';
            ddEl.style.top   = (dropdownConfig.y / nh * 100) + '%';
            if (dropdownConfig.w) {
                ddEl.style.width = (dropdownConfig.w / nw * 100) + '%';
            }
        }
    }

    /* TẠO CÁC VÙNG HOTSPOT (GIỮ NGUYÊN POPUP 58) */
    hotspots.forEach(function(hsData, idx) {
        const hs = document.createElement('div');
        hs.id = 'pp_mh59_hs_' + idx;
        hs.dataset.idx = idx;
        hs.style.cssText = 'position:absolute;cursor:pointer;z-index:10;'
            + 'border:2px dashed transparent;transition:border 0.15s,background 0.15s;box-sizing:border-box;';
        imgWrap.appendChild(hs);
        hsEls.push({ hs: hs, data: hsData });

        hs.addEventListener('mouseenter', function() {
            if (!window._ppMh59Done[idx] && !_mhDebug) {
                hs.style.border = '2px dashed #93c5fd';
            }
        });
        hs.addEventListener('mouseleave', function() {
            if (!window._ppMh59Done[idx] && !_mhDebug) {
                hs.style.border = '2px dashed transparent';
            }
        });

        hs.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            if (_mhDebug || window._ppMh59Confirmed) return;
            
            _hidePopupError('pp_err_mh59');
            if (window._ppMh59Done[idx]) return;

            window._ppMh59Done[idx] = true;
            hs.style.border = '2px solid #16a34a';
            hs.style.background = 'rgba(22, 163, 74, 0.15)';
            updateHint();

            const allDone = window._ppMh59Done.every(Boolean);
            if (allDone) {
                if (dropdownConfig) {
                    hintBar.innerHTML = '👉 <b>Đã chọn đủ vị trí!</b> Chọn tiếp tùy chọn trong Menu hiển thị.';
                    showDropdownMenu();
                } else {
                    window._ppMh59Confirmed = true;
                    hintBar.innerHTML = '✅ Đã chọn đủ tất cả vị trí!';
                    setTimeout(function() { closeMosPopup(); checkCorrect(); }, 400);
                }
            }
        });
    });

    /* TẠO MENU DROPDOWN */
    function showDropdownMenu() {
        let ddEl = document.getElementById('pp_mh59_dropdown');
        if (!ddEl && dropdownConfig) {
            ddEl = document.createElement('div');
            ddEl.id = 'pp_mh59_dropdown';
            ddEl.style.cssText = 'position:absolute;z-index:30;background:#fff;border:1px solid #3b82f6;'
                + 'box-shadow:0 4px 12px rgba(0,0,0,0.2);border-radius:4px;overflow:hidden;min-width:160px;';

            const ul = document.createElement('ul');
            ul.style.cssText = 'list-style:none;margin:0;padding:4px 0;font-size:13px;color:#1f2937;';

            (dropdownConfig.options || []).forEach(function(optText, optIdx) {
                const li = document.createElement('li');
                li.style.cssText = 'padding:6px 12px;cursor:pointer;transition:background 0.15s;';
                li.textContent = optText;

                li.addEventListener('mouseenter', function() { li.style.background = '#eff6ff'; });
                li.addEventListener('mouseleave', function() { li.style.background = 'transparent'; });

                li.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (_mhDebug || window._ppMh59Confirmed) return;

                    const correctIdx = (typeof dropdownConfig.correctIndex === 'number') ? dropdownConfig.correctIndex : 0;
                    
                    if (optIdx === correctIdx) {
                        window._ppMh59Confirmed = true;
                        li.style.background = '#dcfce7';
                        li.style.color = '#15803d';
                        li.style.fontWeight = 'bold';
                        hintBar.innerHTML = '✅ Chính xác!';

                        setTimeout(function() {
                            closeMosPopup();
                            checkCorrect();
                        }, 350);
                    } else {
                        _showPopupError('pp_err_mh59', '❌ Tùy chọn chưa đúng. Vui lòng chọn lại!');
                    }
                });
                ul.appendChild(li);
            });

            ddEl.appendChild(ul);
            imgWrap.appendChild(ddEl);
            positionAll();
        }
        if (ddEl) {
            ddEl.style.display = 'block';
        }
    }

    if (img.complete && img.naturalWidth) { positionAll(); }
    else { img.addEventListener('load', positionAll); }

    body.appendChild(imgWrap);

    /* ============================================================
       XỬ LÝ KÉO-THẢ CHỈNH TỌA ĐỘ VÀ ĐỒNG BỘ #coordBox
       ============================================================ */
    if (_mhDebug) {
        // Mở sẵn danh sách trong chế độ căn chỉnh tọa độ
        if (dropdownConfig) { showDropdownMenu(); }

        // Kéo thả Hotspots (Giữ nguyên từ Popup 58)
        hsEls.forEach(function(item, idx) {
            const hs = item.hs, data = item.data;
            hs.classList.add('debug');
            hs.style.border = '2px dashed red';
            hs.style.background = 'rgba(255, 0, 0, 0.15)';
            hs.style.cursor = 'move';

            function updCoordBox() {
                const cbox = document.getElementById('coordBox');
                if (!cbox) return;
                cbox.style.display = 'block';
                cbox.innerHTML = '[Hotspot ' + (idx + 1) + ' — ' + (data.label || '') + ']<br>'
                    + 'x: ' + Math.round(data.x) + '<br>y: ' + Math.round(data.y)
                    + '<br>width: ' + Math.round(data.w) + '<br>height: ' + Math.round(data.h);
            }
            hs.addEventListener('mouseenter', updCoordBox);

            let dragging = false, sx = 0, sy = 0;
            hs.addEventListener('mousedown', function(e) { dragging = true; sx = e.clientX; sy = e.clientY; e.preventDefault(); });
            document.addEventListener('mousemove', function(e) {
                if (!dragging) return;
                const nw = img.naturalWidth, nh = img.naturalHeight, dw = img.offsetWidth, dh = img.offsetHeight;
                if (!nw || !nh || !dw || !dh) return;
                data.x += (e.clientX - sx) * (nw / dw);
                data.y += (e.clientY - sy) * (nh / dh);
                positionAll(); updCoordBox();
                sx = e.clientX; sy = e.clientY;
            });
            document.addEventListener('mouseup', function() { dragging = false; });
        });

        // Kéo thả Menu Dropdown
        if (dropdownConfig) {
            setTimeout(function() {
                const ddEl = document.getElementById('pp_mh59_dropdown');
                if (ddEl) {
                    ddEl.style.cursor = 'move';
                    ddEl.style.border = '2px dashed blue';

                    function updCoordBoxDD() {
                        const cbox = document.getElementById('coordBox');
                        if (!cbox) return;
                        cbox.style.display = 'block';
                        cbox.innerHTML = '[Dropdown Menu]<br>'
                            + 'x: ' + Math.round(dropdownConfig.x) + '<br>y: ' + Math.round(dropdownConfig.y)
                            + '<br>width: ' + Math.round(dropdownConfig.w || ddEl.offsetWidth);
                    }
                    ddEl.addEventListener('mouseenter', updCoordBoxDD);

                    let draggingDD = false, sxDD = 0, syDD = 0;
                    ddEl.addEventListener('mousedown', function(e) { draggingDD = true; sxDD = e.clientX; syDD = e.clientY; e.preventDefault(); });
                    document.addEventListener('mousemove', function(e) {
                        if (!draggingDD) return;
                        const nw = img.naturalWidth, nh = img.naturalHeight, dw = img.offsetWidth, dh = img.offsetHeight;
                        if (!nw || !nh || !dw || !dh) return;
                        dropdownConfig.x += (e.clientX - sxDD) * (nw / dw);
                        dropdownConfig.y += (e.clientY - syDD) * (nh / dh);
                        positionAll(); updCoordBoxDD();
                        sxDD = e.clientX; syDD = e.clientY;
                    });
                    document.addEventListener('mouseup', function() { draggingDD = false; });
                }
            }, 100);
        }
    } else {
        const cboxOff = document.getElementById('coordBox');
        if (cboxOff) { cboxOff.style.display = 'none'; }
    }

    /* BÁO LỖI & THANH NÚT CHỨC NĂNG */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_mh59';
    errDiv.style.margin = '8px 14px 0';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;padding:8px 14px;border-top:1px solid #e2e8f0;margin-top:8px;background:#fafafa;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    box.appendChild(body);
    box.style.width = '100%';
    box.style.maxWidth = 'none';
    
    const overlay = box.closest('.mos-popup-overlay');
    if (overlay) {
        overlay.style.alignItems = 'flex-start';
        overlay.style.overflowY = 'auto';
        overlay.style.paddingTop = '0';
    }
}

/* ============================================================
   60. POPUP VESHAPE — Vẽ Shape (Cube/Star/Horizontal Scroll) + Add Text
   popupType: 'veshape'
   ============================================================
   Dùng ảnh tĩnh (step.img) + step.hotspot xác định vùng trống cần
   "vẽ" Shape. Học sinh CLICK TRÁI vào đúng vùng hotspot đó → hệ
   thống tự vẽ Shape (theo shapeType khai báo) với kích thước/vị trí
   = đúng hotspot đã đặt. Sau đó CLICK PHẢI vào Shape vừa vẽ → menu
   ngữ cảnh (Add Text/Cut/Copy/Paste) → chọn Add Text (gõ tay) hoặc
   Paste (tự động điền đúng nội dung, mô phỏng dán clipboard) →
   nhập/dán đúng văn bản là hoàn thành bước.

popupType: 'veshape',
popupAnswer: {
  	shapeType:   'cube',              
  	insertText:  'Begin in October!',
  	enableCut:   false,
  	enableCopy:  false,
  	enablePaste: true }},

  shapeType:   'cube',              // 'cube' | 'star' | 'horizontal-scroll'
============================================================ */
function _veShapeStarPoints(x, y, w, h){
    const cx = x + w/2, cy = y + h/2;
    const rx = Math.abs(w/2), ry = Math.abs(h/2);
    const innerRx = rx*0.4, innerRy = ry*0.4;
    let pts = [];
    for(let i=0;i<10;i++){
        const angle = (i*Math.PI)/5 - Math.PI/2;
        const rX = i%2===0 ? rx : innerRx;
        const rY = i%2===0 ? ry : innerRy;
        pts.push((cx+rX*Math.cos(angle))+','+(cy+rY*Math.sin(angle)));
    }
    return pts.join(' ');
}
function _veShapeGenerateSVG(type, x, y, w, h){
    if(type === 'star'){
        const points = _veShapeStarPoints(x,y,w,h);
        return '<polygon points="'+points+'" fill="#4472C4" stroke="#2F5597" stroke-width="2"/>';
    }
    if(type === 'cube'){
        const depth = Math.min(w,h) * 0.25;
        const fx=x, fy=y+depth, fw=w-depth, fh=h-depth;
        const topFace = fx+','+fy+' '+(fx+depth)+','+y+' '+(fx+w)+','+y+' '+(fx+fw)+','+fy;
        const sideFace = (fx+fw)+','+fy+' '+(fx+w)+','+y+' '+(fx+w)+','+(y+fh)+' '+(fx+fw)+','+(fy+fh);
        return '<g>'
            +'<polygon points="'+topFace+'" fill="#8EA9DB" stroke="#2F5597" stroke-width="1.5"/>'
            +'<polygon points="'+sideFace+'" fill="#305496" stroke="#2F5597" stroke-width="1.5"/>'
            +'<rect x="'+fx+'" y="'+fy+'" width="'+fw+'" height="'+fh+'" fill="#4472C4" stroke="#2F5597" stroke-width="1.5"/>'
            +'</g>';
    }
    if(type === 'horizontal-scroll'){
        const scrollW = w*0.12;
        const mainX = x+scrollW, mainW = w-(scrollW*2);
        return '<g>'
            +'<rect x="'+mainX+'" y="'+y+'" width="'+mainW+'" height="'+h+'" fill="#4472C4" stroke="#2F5597" stroke-width="1.5"/>'
            +'<line x1="'+mainX+'" y1="'+y+'" x2="'+(mainX+mainW)+'" y2="'+y+'" stroke="#2F5597" stroke-width="1.5"/>'
            +'<line x1="'+mainX+'" y1="'+(y+h)+'" x2="'+(mainX+mainW)+'" y2="'+(y+h)+'" stroke="#2F5597" stroke-width="1.5"/>'
            +'<rect x="'+x+'" y="'+y+'" width="'+scrollW+'" height="'+h+'" rx="'+(scrollW/2)+'" fill="#8EA9DB" stroke="#2F5597" stroke-width="1.5"/>'
            +'<path d="M '+mainX+' '+y+' A '+(scrollW/2)+' '+(h/2)+' 0 0 0 '+mainX+' '+(y+h)+'" fill="#305496" stroke="#2F5597" stroke-width="1"/>'
            +'<rect x="'+(x+w-scrollW)+'" y="'+y+'" width="'+scrollW+'" height="'+h+'" rx="'+(scrollW/2)+'" fill="#8EA9DB" stroke="#2F5597" stroke-width="1.5"/>'
            +'<path d="M '+(x+w-scrollW)+' '+y+' A '+(scrollW/2)+' '+(h/2)+' 0 0 1 '+(x+w-scrollW)+' '+(y+h)+'" fill="#305496" stroke="#2F5597" stroke-width="1"/>'
            +'</g>';
    }
    return '';
}

function openVeShapePopup(step){
    const box = _createPopupShell('Microsoft Word — Shape');
    const ans = step.popupAnswer || {};

    window._ppAns = {
        shapeType:   ans.shapeType   || 'cube',
        insertText:  ('insertText' in ans) ? ans.insertText : undefined,
        enableCut:   ans.enableCut   === true,
        enableCopy:  ans.enableCopy  === true,
        enablePaste: ans.enablePaste === true,
    };
    window._ppVsDrawn     = false;
    window._ppVsConfirmed = false;

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:520px;gap:0;padding:0;font-family:Arial,sans-serif;';

    const hintBar = document.createElement('div');
    hintBar.id = 'pp_vs_hint';
    hintBar.style.cssText = 'font-size:14px;color:#6b7280;background:#f9fafb;'
        +'border-bottom:1px solid #e5e7eb;padding:6px 10px;';
    hintBar.innerHTML = '👉 <b>Click vào vùng trống</b> để vẽ Shape.';
    body.appendChild(hintBar);

    const imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'position:relative;background:#fff;overflow:hidden;';
    const img = document.createElement('img');
    img.src = step.img || step.imgResult || '';
    img.style.cssText = 'width:100%;height:auto;display:block;user-select:none;';
    imgWrap.appendChild(img);

    /* SVG overlay full-size — viewBox = kích thước gốc ảnh để tọa độ shape khớp chính xác với hotspot pixel */
    const svgNS = 'http://www.w3.org/2000/svg';
    const svgOverlay = document.createElementNS(svgNS, 'svg');
    svgOverlay.id = 'pp_vs_svg';
    svgOverlay.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;';
    imgWrap.appendChild(svgOverlay);

    const shapeGroup = document.createElementNS(svgNS,'g');
    shapeGroup.id = 'pp_vs_shapeGroup';
    svgOverlay.appendChild(shapeGroup);

    /* Khung chọn (selection box) hiển thị quanh Shape sau khi vẽ xong, giống Word thật */
    const selBoxGroup = document.createElementNS(svgNS,'g');
    selBoxGroup.id = 'pp_vs_selBoxGroup';
    svgOverlay.appendChild(selBoxGroup);

    /* Vùng click để vẽ (hotspot) */
    const hotspotEl = document.createElement('div');
    hotspotEl.id = 'pp_vs_hotspot';
    hotspotEl.style.cssText = 'position:absolute;cursor:crosshair;'
        +'border:2px dashed transparent;transition:border 0.15s;box-sizing:border-box;z-index:10;';
    imgWrap.appendChild(hotspotEl);
    body.appendChild(imgWrap);

    function positionHotspot(){
        const nw = img.naturalWidth, nh = img.naturalHeight;
        const hs = step.hotspot || {x:100,y:100,w:200,h:150};
        if(!nw || !nh){ return; }
        hotspotEl.style.left   = (hs.x / nw * 100) + '%';
        hotspotEl.style.top    = (hs.y / nh * 100) + '%';
        hotspotEl.style.width  = (hs.w / nw * 100) + '%';
        hotspotEl.style.height = (hs.h / nh * 100) + '%';
        svgOverlay.setAttribute('viewBox', '0 0 '+nw+' '+nh);
    }
    if(img.complete && img.naturalWidth){ positionHotspot(); }
    else{ img.addEventListener('load', positionHotspot); }

    var _vsDebug = (typeof debugMode !== 'undefined' && debugMode);

    hotspotEl.addEventListener('mouseenter', function(){
        if(!window._ppVsDrawn && !_vsDebug){ hotspotEl.style.border = '2px dashed #93c5fd'; }
    });
    hotspotEl.addEventListener('mouseleave', function(){
        if(!window._ppVsDrawn && !_vsDebug){ hotspotEl.style.border = '2px dashed transparent'; }
    });

    /* Vẽ khung chọn (8 tay cầm vuông trắng viền xanh) quanh Shape, giống Word thật khi Shape đang được chọn */
    function _vsDrawSelectionBox(hs){
        const handleSize = Math.max(hs.w, hs.h) * 0.025;
        const hx0 = hs.x, hy0 = hs.y, hx1 = hs.x + hs.w, hy1 = hs.y + hs.h;
        const midX = hs.x + hs.w/2, midY = hs.y + hs.h/2;
        const handles = [
            [hx0,hy0],[midX,hy0],[hx1,hy0],
            [hx0,midY],           [hx1,midY],
            [hx0,hy1],[midX,hy1],[hx1,hy1]
        ];
        let html = '<rect x="'+hx0+'" y="'+hy0+'" width="'+hs.w+'" height="'+hs.h+'" '
            +'fill="none" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4,3"/>';
        handles.forEach(function(pt){
            html += '<rect x="'+(pt[0]-handleSize/2)+'" y="'+(pt[1]-handleSize/2)+'" '
                +'width="'+handleSize+'" height="'+handleSize+'" fill="#fff" stroke="#2563eb" stroke-width="1.5"/>';
        });
        selBoxGroup.innerHTML = html;
    }

    /* Click trái vào vùng hotspot → "vẽ" Shape đúng loại, đúng kích thước hotspot */
    hotspotEl.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        if(_vsDebug || window._ppVsConfirmed){ return; }
        if(window._ppVsDrawn){ return; }
        _hidePopupError('pp_err_vs');

        window._ppVsDrawn = true;
        const hs = step.hotspot || {x:100,y:100,w:200,h:150};
        const svgMarkup = _veShapeGenerateSVG(window._ppAns.shapeType, hs.x, hs.y, hs.w, hs.h);
        shapeGroup.innerHTML = svgMarkup;
        _vsDrawSelectionBox(hs);

        hotspotEl.style.border = '2px solid transparent';
        hotspotEl.style.cursor = 'context-menu';
        hintBar.innerHTML = '✅ Đã vẽ xong Shape — 👉 <b>Click phải</b> vào Shape để chọn "Add Text".';
    });

    /* Click phải vào vùng hotspot (chỉ hoạt động sau khi đã vẽ) → hiện menu ngữ cảnh */
    hotspotEl.addEventListener('contextmenu', function(e){
        e.preventDefault(); e.stopPropagation();
        if(_vsDebug || window._ppVsConfirmed){ return; }
        if(!window._ppVsDrawn){
            _showPopupError('pp_err_vs', '❌ Chưa vẽ Shape — hãy <b>click trái</b> để vẽ trước.');
            return;
        }
        _hidePopupError('pp_err_vs');
        _pp_vsShowContextMenu(hotspotEl);
    });

    /* Debug — kéo-thả chỉnh tọa độ hotspot, dùng chung #coordBox */
    if(_vsDebug){
        hotspotEl.classList.add('debug');
        hotspotEl.style.border = '2px dashed red';
        hotspotEl.style.background = 'rgba(255,0,0,0.15)';
        hotspotEl.style.cursor = 'move';

        function _vsUpdateCoordBox(){
            const cbox = document.getElementById('coordBox');
            if(!cbox){ return; }
            const hs = step.hotspot;
            cbox.style.display = 'block';
            cbox.innerHTML = 'x: '+Math.round(hs.x)+'<br>y: '+Math.round(hs.y)+'<br>width: '+Math.round(hs.w)+'<br>height: '+Math.round(hs.h)
                +'<br><button type="button" onclick="_pp_vsCenterHotspot()" style="margin-top:8px;padding:6px 14px;background:#f59e0b;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">🎯 Đưa về giữa khung</button>';
        }
        _vsUpdateCoordBox();

        window._pp_vsCenterHotspot = function(){
            const nw = img.naturalWidth, nh = img.naturalHeight;
            if(!nw || !nh){ return; }
            step.hotspot.x = Math.round((nw - step.hotspot.w) / 2);
            step.hotspot.y = Math.round((nh - step.hotspot.h) / 2);
            positionHotspot();
            _vsUpdateCoordBox();
        };

        let _vsDragging = false, _vsSX = 0, _vsSY = 0;
        hotspotEl.addEventListener('mousedown', function(e){
            _vsDragging = true; _vsSX = e.clientX; _vsSY = e.clientY; e.preventDefault();
        });
        document.addEventListener('mousemove', function(e){
            if(!_vsDragging){ return; }
            const nw = img.naturalWidth, nh = img.naturalHeight;
            const dispW = img.offsetWidth, dispH = img.offsetHeight;
            if(!nw || !nh || !dispW || !dispH){ return; }
            step.hotspot.x += (e.clientX - _vsSX) * (nw / dispW);
            step.hotspot.y += (e.clientY - _vsSY) * (nh / dispH);
            positionHotspot();
            _vsUpdateCoordBox();
            _vsSX = e.clientX; _vsSY = e.clientY;
        });
        document.addEventListener('mouseup', function(){ _vsDragging = false; });
    } else {
        const cboxOff = document.getElementById('coordBox');
        if(cboxOff){ cboxOff.style.display = 'none'; }
    }

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_vs';
    errDiv.style.margin = '8px 14px 0';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;padding:8px 14px;border-top:1px solid #e2e8f0;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    box.appendChild(body);
    box.style.setProperty('width', '100%', 'important');
    box.style.setProperty('max-width', 'none', 'important');
    const overlay = box.closest('.mos-popup-overlay');
    if(overlay){
        overlay.style.alignItems = 'flex-start';
        overlay.style.overflowY  = 'auto';
        overlay.style.paddingTop = '0';
    }
    const sim0Vs = document.getElementById('simulator0');
    if(sim0Vs && sim0Vs.clientWidth){
        box.style.setProperty('width', sim0Vs.clientWidth + 'px', 'important');
    }
}

/* Menu ngữ cảnh của popup 60 — dùng position:fixed để không bị cắt bởi overflow:hidden */
function _pp_vsShowContextMenu(hotspotEl){
    const old = document.getElementById('pp_vs_ctxmenu');
    if(old){ old.remove(); }

    const rect = hotspotEl.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id = 'pp_vs_ctxmenu';
    menu.style.cssText = 'position:fixed;left:'+rect.left+'px;top:'+(rect.top + rect.height/2)+'px;'
        +'background:#fff;border:1px solid #94a3b8;border-radius:4px;'
        +'box-shadow:0 4px 14px rgba(0,0,0,0.25);z-index:99999;min-width:150px;font-size:14px;';

    const a = window._ppAns || {};
    const items = [
        { label:'Add Text', active:true,           action:'addtext' },
        { label:'Cut',      active:a.enableCut,     action:'cut'     },
        { label:'Copy',     active:a.enableCopy,    action:'copy'    },
        { label:'Paste',    active:a.enablePaste,   action:'paste'   },
    ];
    items.forEach(function(it){
        const row = document.createElement('div');
        row.textContent = it.label;
        row.style.cssText = 'padding:7px 14px;'
            +(it.active ? 'cursor:pointer;color:#1e3a5f;' : 'cursor:not-allowed;color:#c1c7cf;');
        if(it.active){
            row.addEventListener('mouseenter', function(){ row.style.background='#eff6ff'; });
            row.addEventListener('mouseleave', function(){ row.style.background=''; });
            row.addEventListener('click', function(e){
                e.stopPropagation();
                menu.remove();
                document.removeEventListener('click', _pp_vsCloseMenuOutside);
                if(it.action === 'addtext'){
                    _pp_vsActivateAddText(hotspotEl, false);
                } else if(it.action === 'paste'){
                    _pp_vsActivateAddText(hotspotEl, true);
                }
            });
        }
        menu.appendChild(row);
    });

    document.body.appendChild(menu);
    setTimeout(function(){ document.addEventListener('click', _pp_vsCloseMenuOutside); }, 0);
}
function _pp_vsCloseMenuOutside(e){
    const menu = document.getElementById('pp_vs_ctxmenu');
    if(menu && !menu.contains(e.target)){
        menu.remove();
        document.removeEventListener('click', _pp_vsCloseMenuOutside);
    }
}

/* Sau khi chọn Add Text / Paste — hiện ô nhập ngay giữa vùng hotspot (giống popup 51) */
function _pp_vsActivateAddText(hotspotEl, autoFill){
    const a = window._ppAns || {};
    hotspotEl.style.display = 'flex';
    hotspotEl.style.alignItems = 'center';
    hotspotEl.style.justifyContent = 'center';

    const inputWrap = document.createElement('div');
    inputWrap.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;'
        +'display:flex;align-items:center;justify-content:center;z-index:15;';
    inputWrap.innerHTML = '<input type="text" id="pp_vs_textInput" placeholder="Nhập nội dung..."'
        +' style="width:80%;text-align:center;padding:2px 4px;border:none;border-bottom:2px solid #2563eb;'
        +'background:rgba(255,255,255,0.9);font-size:14px;color:#1e3a5f;font-weight:bold;outline:none;">';
    hotspotEl.appendChild(inputWrap);

    const inp = document.getElementById('pp_vs_textInput');
    if(!inp){ return; }
    inp.addEventListener('click', function(e){ e.stopPropagation(); });
    inp.addEventListener('contextmenu', function(e){ e.stopPropagation(); });

    function _pp_vsValidateInput(){
        _hidePopupError('pp_err_vs');
        if(window._ppVsConfirmed){ return; }
        const val = inp.value.trim();
        if(a.insertText !== undefined && val === a.insertText){
            window._ppVsConfirmed = true;
            setTimeout(function(){ closeMosPopup(); checkCorrect(); }, 400);
        }
    }
    inp.addEventListener('input', _pp_vsValidateInput);

    if(autoFill && a.insertText !== undefined){
        /* Mô phỏng Paste: đánh dấu hoàn thành đúng, KHÔNG hiển thị chuỗi đáp án thật lên màn hình */
        inp.value = '(Đã dán nội dung)';
        inp.readOnly = true;
        window._ppVsConfirmed = true;
        setTimeout(function(){ closeMosPopup(); checkCorrect(); }, 400);
    } else {
        setTimeout(function(){ inp.focus(); }, 30);
    }
}

/* ============================================================
   61. POPUP TEXT SELECTION (SỬA LỖI KHÔNG CHỌN ĐƯỢC INDEX)	
	//startIndex: không tính rổng + các từ giữa tính rỗng (Word là phần mềm 10-26), bắt đầu là 0, kí tự đầu là 1=M 
	//    hideParagraph2: true,   // ← MỚI: ẩn hẳn Đoạn 2, không hiện văn bản mặc định nữa

// 1. Kéo thả vị trí bất kì
popupType: 'text-selection',
popupAnswer: {
        lineAboveText: 'ABC',
        lineBelowText: 'MOS',
        textParagraph: 'word',
	hideParagraph2: true,
        expectedText: 'word',
        isDrag: true,
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 2. Nháy đúp - chọn 1 từ
    popupType: 'text-selection',
    popupAnswer: {
        lineAboveText: 'ABC',
        lineBelowText: 'MOS',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
	hideParagraph2: true,
        isDoubleClick: true,
        isTripleClick: false,
        isDrag: false,
        targetWord: 'Word',
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 3. Nháy 3 lần - chọn Đoạn 1
popupType: 'text-selection',
popupAnswer: {
        lineAboveText: 'ABC',
        lineBelowText: '',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
	hideParagraph2: true,
        isDoubleClick: false,
        isTripleClick: true,
        isDrag: false,
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 4. Nháy chọn Dòng 1 (Dòng trống trên)
popupType: 'text-selection',
popupAnswer: {
        lineAboveText: ' ',
        targetLine: 'line-above',
	hideParagraph2: true, 
	fontSize: { dong1: '15pt', dong2: '15pt', doan1: '16pt', doan2: '16pt' }
	}},

// 5. Chọn Dòng 2 (Dòng trống dưới)
popupType: 'text-selection',
popupAnswer: {
        lineBelowText: ' ',
        targetLine: 'line-below',
	hideParagraph2: true,
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 6. Kéo thả chọn cụm từ ở Đoạn 2
    popupType: 'text-selection',
    popupAnswer: {
        lineAboveText: 'ABC',
        lineBelowText: 'MOS',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
        textParagraph2: 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.',
	targetParagraph: 'main-text-2',
        isDrag: true,
        expectedText: 'xử lý tài liệu chuyên nghiệp',
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 7. Nháy đúp chọn 1 từ ở Đoạn 2
popupType: 'text-selection',
popupAnswer: {
	lineAboveText: '',
        lineBelowText: '',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
        textParagraph2: 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.',
        targetParagraph: 'main-text-2',
        isDoubleClick: true,
        targetWord: 'chuyên',
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 8. Mặc định chọn Đoạn 2 (2 Dòng tiêu đề rỗng)
popupType: 'text-selection',
popupAnswer: {
        lineAboveText: '',
        lineBelowText: '',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
        textParagraph2: 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.',
        targetParagraph: 'main-text-2',
        isTripleClick: true, 
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 9. Chọn Đoạn 1
popupType: 'text-selection',
popupAnswer: {
        lineAboveText: '',
        lineBelowText: 'MOS',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
	hideParagraph2: true,
        targetParagraph: 'main-text',
        isTripleClick: true,
        isDoubleClick: false,
        isDrag: false, 
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 10. Chọn Đoạn 2
    popupType: 'text-selection',
    popupAnswer: {
        lineAboveText: 'I. GIỚI THIỆU CHUNG',
        lineBelowText: 'II. HƯỚNG DẪN SỬ DỤNG',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
        textParagraph2: 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.',
        targetParagraph: 'main-text-2',
        isTripleClick: true,
        isDoubleClick: false,
        isDrag: false, 
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 11. dùng tab, kéo thả, Thụt 2 lần (Cấp 1), Thụt 3 lần (Cấp 2), có thể dùng nháy đúp
popupType: 'text-selection',
popupAnswer: {
    	isDrag: true,
    	targetParagraph: 'main-text',
    	expectedText: 'MOS Version 2013 Version 2016 IC3 Ethan Hawke',
	hideParagraph2: true,
    	lines: [
        	{ text: 'MOS', indent: 2 },            
        	{ text: 'Version 2013', indent: 3 },   
        	{ text: 'Version 2016', indent: 3 },   
        	{ text: 'IC3', indent: 2 },           
        	{ text: 'Ethan', indent: 2 },          
        	{ text: 'Hawke', indent: 2 }           
    		],
        lineAboveText: 'Courses of MOS',  
    	lineBelowText: '@MOS' }},

   ============================================================ */

function openTextSelectionPopup(step) {
    // 1. Tự động chuẩn hóa dữ liệu đầu vào
    if (!step) step = {};
    if (!step.popupAnswer && (step.textParagraph || step.lines || step.expectedText || step.targetLine || step.targetParagraph)) {
        step = { popupAnswer: step };
    }

    /* Hàm chuẩn hóa chuỗi (Triệt tiêu ngắt dòng, tab, khoảng trắng rác) */
    function normalizeText(str) {
        if (!str) return '';
        return str.replace(/[\r\n\t\u00A0]+/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // Khung Popup
    var box = typeof _createPopupShell === 'function' 
        ? _createPopupShell('Microsoft Word') 
        : createFallbackShell61('Microsoft Word');
    var ans = step.popupAnswer || {};

    // 2. Mặc định văn bản cho các Đoạn và Dòng minh họa / Dòng trống
    var DEFAULT_PARAGRAPH_1 = 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.';
    var DEFAULT_PARAGRAPH_2 = 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.';
    var fs = ans.fontSize || {};
    var sizeLine1 = fs.dong1 || '18px';
    var sizeLine2 = fs.dong2 || '18px';
    var sizePara1 = fs.doan1 || '14px';
    var sizePara2 = fs.doan2 || '14px';
    var lineAboveText = (typeof ans.lineAboveText !== 'undefined') ? ans.lineAboveText : '';
    var lineBelowText = (typeof ans.lineBelowText !== 'undefined') ? ans.lineBelowText : '';

    // 3. Trích xuất văn bản đoạn từ Answer
    var rawPara1 = ans.textParagraph || ans.expectedText || '';
    var mainText1 = rawPara1.replace(/\u00A0/g, ' ').trim() || DEFAULT_PARAGRAPH_1;
    // MỚI (Answer 11+): nếu khai báo "lines" (mảng thụt lề) mà chưa có textParagraph/expectedText,
    // tự ghép làm mainText1 dự phòng — không ảnh hưởng Answer cũ (chúng không khai báo "lines").
    if ((!rawPara1 || !rawPara1.trim()) && ans.lines && Array.isArray(ans.lines)) {
        mainText1 = ans.lines.map(function(item) { return item.text; }).join(' ');
    }

    var rawPara2 = ans.textParagraph2 || '';
    var mainText2 = rawPara2.replace(/\u00A0/g, ' ').trim() || DEFAULT_PARAGRAPH_2;

    // 4. Xác định Đoạn mục tiêu cần làm bài tập
    var rawTarget = ans.targetParagraph || 'main-text';
    if (rawTarget === 'main-text-1') rawTarget = 'main-text';
    var targetParagraph = rawTarget;
    var currentTargetText = (targetParagraph === 'main-text-2') ? mainText2 : mainText1;

    // 5. Xác định chuỗi cần kiểm tra (expectedText)
    var expectedStart = (typeof ans.startIndex === 'number') ? ans.startIndex : null;
    var expectedEnd = (typeof ans.endIndex === 'number') ? ans.endIndex : null;
    var rawExpected = '';
    if (ans.expectedText) {
        rawExpected = ans.expectedText;
    } else if (expectedStart !== null && expectedEnd !== null) {
        rawExpected = currentTargetText.substring(expectedStart, expectedEnd);
    } else if (ans.targetWord) {
        rawExpected = ans.targetWord;
    } else if (ans.lines && Array.isArray(ans.lines)) {
        // MỚI (Answer 11+): có "lines" nhưng không có expectedText/startIndex-endIndex/targetWord
        // → tự ghép đáp án từ nội dung các dòng, cách nhau 1 khoảng trắng.
        rawExpected = ans.lines.map(function(item) { return item.text; }).join(' ');
    } else {
        rawExpected = currentTargetText;
    }
    var expectedText = normalizeText(rawExpected);

    // 6. Cấu hình cờ và thao tác mục tiêu
    var rawTargetLine = ans.targetLine || targetParagraph;
    if (rawTargetLine === 'main-text-1') rawTargetLine = 'main-text';
    var correctTargetLine = rawTargetLine;
    var isDoubleClick = ans.isDoubleClick === true;
    var isTripleClick = ans.isTripleClick === true;
    var isDrag = ans.isDrag === true;
    window._pp61TextConfirmed = false;
    var body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:520px;gap:0;padding:0;font-family:Arial,sans-serif;width:100%;box-sizing:border-box;';

    /* ── THANH HƯỚNG DẪN ── */
    var hintBar = document.createElement('div');
    hintBar.style.cssText = 'font-size:13px;color:#374151;background:#f3f4f6;border-bottom:1px solid #d1d5db;padding:10px 16px;';
    var actionGuide = '👉 Hãy thực hiện thao tác chọn vị trí hoặc bôi đen văn bản theo yêu cầu.';
    if (correctTargetLine === 'line-above') {
        actionGuide = '👉 Hãy <b>nhấp chuột vào dòng phía trên</b>: <b>"' + (lineAboveText.trim() || '[Dòng trống]') + '"</b>';
    } else if (correctTargetLine === 'line-below') {
        actionGuide = '👉 Hãy <b>nhấp chuột vào dòng ở giữa/dưới</b>: <b>"' + (lineBelowText.trim() || '[Dòng trống]') + '"</b>';
    } else if (isDoubleClick) {
        actionGuide = '👉 Hãy <b>nháy đúp chuột (Double-click)</b> vào từ: <b>"' + (expectedText || ans.targetWord) + '"</b>';
    } else if (isTripleClick) {
        actionGuide = '👉 Hãy <b>nháy chuột 3 lần (Triple-click)</b> để chọn toàn bộ đoạn văn bản yêu cầu.';
    } else if (isDrag) {
        actionGuide = '👉 Hãy <b>kéo thả chuột</b> để bôi đen: <b>"' + expectedText + '"</b>';
    }
    hintBar.innerHTML = actionGuide;
    body.appendChild(hintBar);

    /* ── VÙNG HIỂN THỊ CẤU TRÚC VĂN BẢN ── */
    var doc = document.createElement('div');
    doc.style.cssText = 'padding:16px;background:#fff;width:100%;box-sizing:border-box;max-height:60vh;overflow-y:auto;';
    var docFrame = document.createElement('div');
    docFrame.style.cssText = 'border:1px solid #cbd5e1;border-radius:4px;padding:16px;background:#fff;';
    var baseLineStyle = 'line-height:1.4;font-weight:bold;color:#334155;cursor:pointer;padding:4px 8px;margin:0px 0;user-select:text;display:block;min-height:14px;white-space:pre-wrap;';
    var baseTextStyle = 'line-height:1.4;color:#1f2937;cursor:text;white-space:pre-wrap;padding:6px 8px;margin:0px 0;user-select:text;';

    // 1. Dòng trên
    var lineAbove = document.createElement('div');
    lineAbove.className = 'pp-line-item';
    lineAbove.dataset.lineType = 'line-above';
    lineAbove.style.cssText = baseLineStyle + 'font-size:' + sizeLine1 + ';';
    lineAbove.textContent = lineAboveText;

    // 2. Đoạn văn 1
    var textContainer1 = document.createElement('div');
    textContainer1.id = 'pp_text_container_1';
    textContainer1.dataset.lineType = 'main-text';
    textContainer1.style.cssText = baseTextStyle + 'font-size:' + sizePara1 + ';';
    // MỚI (Answer 11+): nếu khai báo "lines" (mảng {text, indent}), render từng dòng riêng có thụt lề
    // bằng padding-left (1 cấp = 20px) — KHÔNG dùng ký tự khoảng trắng/nbsp giả lập.
    // Answer nào không khai báo "lines" vẫn chạy đúng nhánh else, y hệt trước giờ.
    if (ans.lines && Array.isArray(ans.lines)) {
        ans.lines.forEach(function(item) {
            var lineDiv = document.createElement('div');
            var indentPx = (item.indent || 0) * 20;
            lineDiv.style.cssText = 'padding-left:' + indentPx + 'px;line-height:1.4;user-select:text;';
            lineDiv.textContent = item.text;
            textContainer1.appendChild(lineDiv);
        });
    } else {
        textContainer1.textContent = mainText1;
    }

    // 3. Dòng dưới / Giữa
    var lineBelow = document.createElement('div');
    lineBelow.className = 'pp-line-item';
    lineBelow.dataset.lineType = 'line-below';
    lineBelow.style.cssText = baseLineStyle + 'font-size:' + sizeLine2 + ';';
    lineBelow.textContent = lineBelowText;

    // 4. Đoạn văn 2
    var textContainer2 = document.createElement('div');
    textContainer2.id = 'pp_text_container_2';
    textContainer2.dataset.lineType = 'main-text-2';
    textContainer2.style.cssText = baseTextStyle + 'font-size:' + sizePara2 + ';';
    textContainer2.textContent = mainText2;
    docFrame.appendChild(lineAbove);
    docFrame.appendChild(textContainer1);
    docFrame.appendChild(lineBelow);
    // MỚI: ẩn hẳn Đoạn văn 2 khi câu hỏi khai báo hideParagraph2:true (không hiện văn bản mặc định gây rối mắt)
    if (ans.hideParagraph2 !== true) {
        docFrame.appendChild(textContainer2);
    }
    doc.appendChild(docFrame);
    body.appendChild(doc);

    /* ── VÙNG BÁO LỖI & NÚT ── */
    var errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_text_select';
    errDiv.style.cssText = 'margin:0 16px 8px 16px;color:#dc2626;font-size:13px;font-weight:bold;';
    body.appendChild(errDiv);
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #e2e8f0;background:#f8fafc;';
    var btnCancel = document.createElement('button');
    btnCancel.className = 'pp-btn pp-btn-cancel';
    btnCancel.textContent = 'Cancel';
    btnCancel.onclick = function() {
        if (typeof closeMosPopup === 'function') closeMosPopup();
    };
    btnRow.appendChild(btnCancel);
    body.appendChild(btnRow);

    /* ── XỬ LÝ LỖI DỰ PHÒNG ── */
    function displayError(msg) {
        if (typeof _showPopupError === 'function') {
            _showPopupError('pp_err_text_select', msg);
        } else {
            errDiv.textContent = msg;
        }
    }
    function clearError() {
        if (typeof _hidePopupError === 'function') {
            _hidePopupError('pp_err_text_select');
        } else {
            errDiv.textContent = '';
        }
    }

    /* ── PHÂN LUỒNG XỬ LÝ SỰ KIỆN ── */
    [lineAbove, lineBelow].forEach(function(lineEl) {
        lineEl.addEventListener('click', function() {
            if (window._pp61TextConfirmed) return;
            var clickedLineType = lineEl.dataset.lineType;

            if (clickedLineType === correctTargetLine) {
                showSuccess('✅ Chính xác! Bạn đã chọn đúng vị trí dòng yêu cầu.');
            } else {
                displayError('❌ Chưa đúng vị trí dòng theo yêu cầu đề bài.');
            }
        });
    });

    [textContainer1, textContainer2].forEach(function(containerEl) {
        var currentType = containerEl.dataset.lineType;
        if (isDoubleClick) {
            containerEl.addEventListener('dblclick', function() {
                if (window._pp61TextConfirmed) return;
                var sel = window.getSelection();
                var selectedText = sel ? normalizeText(sel.toString()) : '';
                if (currentType === targetParagraph && (selectedText === expectedText || selectedText === ans.targetWord)) {
                    showSuccess('✅ Chính xác! Bạn đã nháy đúp đúng từ yêu cầu.');
                } else if (currentType !== targetParagraph) {
                    displayError('❌ Bạn đang thao tác sai đoạn văn yêu cầu.');
                } else {
                    displayError('❌ Chưa đúng! Cần nháy đúp vào từ: "' + (expectedText || ans.targetWord) + '"');
                }
            });
        }
        else if (isTripleClick) {
            containerEl.addEventListener('click', function(e) {
                if (window._pp61TextConfirmed) return;
                if (e.detail === 3) {
                    if (currentType === targetParagraph) {
                        showSuccess('✅ Chính xác! Bạn đã nháy 3 lần chọn toàn bộ đoạn văn.');
                    } else {
                        displayError('❌ Bạn đã nháy 3 lần sai đoạn văn yêu cầu.');
                    }
                }
            });
        }
        else if (isDrag) {
            function processTextSelection() {
                if (window._pp61TextConfirmed) return;
                var sel = window.getSelection();
                if (!sel || sel.isCollapsed) return;
                var isInsideContainer = containerEl.contains(sel.anchorNode) || containerEl.contains(sel.focusNode);
                if (!isInsideContainer) return;
                var selectedText = normalizeText(sel.toString());
                if (!selectedText) return;
                if (currentType === targetParagraph && selectedText === expectedText) {
                    showSuccess('✅ Chính xác! Bạn đã bôi đen đúng văn bản.');
                } else if (currentType !== targetParagraph) {
                    displayError('❌ Bạn đang bôi đen ở sai đoạn văn yêu cầu.');
                } else {
                    displayError('❌ Chưa chính xác! Hãy kéo thả bôi đen đúng đoạn văn yêu cầu.');
                }
            }
            containerEl.addEventListener('mouseup', function() {
                setTimeout(processTextSelection, 30);
            });
            containerEl.addEventListener('touchend', function() {
                setTimeout(processTextSelection, 100);
            });
        }
    });

    function showSuccess(msg) {
        window._pp61TextConfirmed = true;
        clearError();
        hintBar.innerHTML = '<b>' + msg + '</b>';
        hintBar.style.background = '#dcfce7';
        hintBar.style.color = '#15803d';
        setTimeout(function() {
            if (typeof closeMosPopup === 'function') closeMosPopup();
            if (typeof checkCorrect === 'function') {
                checkCorrect();
            } else if (typeof _checkPopupAnswer === 'function') {
                _checkPopupAnswer(true);
            }
        }, 500);
    }

    box.appendChild(body);
    box.style.width = '98%';
    box.style.maxWidth = 'none';

    setTimeout(function() {
        var overlay = box.closest('.mos-popup-overlay');
        if (overlay) {
            overlay.style.alignItems = 'flex-start';
            overlay.style.overflowY  = 'auto';
            overlay.style.paddingTop = '10px';
        }
        body.querySelectorAll('label,input,select,button').forEach(function(el) { 
            el.style.fontSize = '14px'; 
        });
    }, 0);
}


/* Khung dự phòng trong trường hợp thiếu _createPopupShell */
function createFallbackShell61(title) {
    var overlay = document.querySelector('.mos-popup-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mos-popup-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = '';
    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.2);overflow:hidden;font-family:Arial,sans-serif;min-width:520px;';
    var header = document.createElement('div');
    header.style.cssText = 'background:#2563eb;color:#fff;padding:10px 16px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span>' + title + '</span><span style="cursor:pointer;" onclick="if(typeof closeMosPopup===\'function\')closeMosPopup();">✕</span>';
    box.appendChild(header);
    overlay.appendChild(box);
    return box;
}


/* ============================================================
   Popup 62. Chọn Bảng / Dòng / Từ / Tiêu đề Bảng 
// 1. Chọn toàn bộ Bảng (Có tiêu đề)
popupType: 'table-row-selection',
popupAnswer: {
    tableTitle: 'Bảng 1. Lịch học các môn tin học văn phòng',
    targetTable: true, 
    tableData: [       
        ['Môn học',  'Thứ',    'Giờ học'],
        ['Word',     'Thứ 2',  '8:00 AM'],
        ['Excel',    'Thứ 4',  '9:00 AM'],
        ['PowerPoint','Thứ 6', '10:00 AM']]
	}},

// 2. Chọn Dòng trong Bảng (Có tiêu đề)
popupType: 'table-row-selection',
popupAnswer: {
    tableTitle: 'Bảng 2. Danh sách phân công',
    targetTableRow: 1, 
    tableData: [       
        ['Môn học',  'Thứ',    'Giờ học'],
        ['Word',     'Thứ 2',  '8:00 AM'],
        ['Excel',    'Thứ 4',  '9:00 AM'],
        ['PowerPoint','Thứ 6', '10:00 AM']]
	}},

// 3. Chọn 1 từ trong Bảng (Có tiêu đề)
popupType: 'table-row-selection',
popupAnswer: {
    tableTitle: 'Bảng 3. Thông tin tác giả',
    targetWord: 'Margaret',
    tableData: [
        ['Name', 'Role', 'Quantity'],
        ['Margaret', 'Author', '3'],
        ['Rory Seiler', 'Author', '4']]
	}},

// CÁCH 1A: Chọn Dòng tiêu đề (Nhấp đơn)
popupType: 'table-row-selection',
popupAnswer: {
    tableTitle: 'Bảng 1. Lịch học các môn tin học văn phòng',
    targetTitle: true, // Nhận diện mục tiêu là Dòng tiêu đề
    tableData: [        
        ['Môn học',    'Thứ',    'Giờ học'],
        ['Word',       'Thứ 2',  '8:00 AM'],
        ['Excel',      'Thứ 4',  '9:00 AM'],
        ['PowerPoint', 'Thứ 6', '10:00 AM']]
	}},

// CÁCH 1B: Chọn Đoạn tiêu đề bằng Nháy 3 lần (Triple Click)
popupType: 'table-row-selection',
popupAnswer: {
    tableTitle: 'Bảng 1. Lịch học các môn tin học văn phòng',
    targetTitle: true,
    targetTitleSelectMode: 'tripleClick', 
    tableData: [        
        ['Môn học',    'Thứ',    'Giờ học'],
        ['Word',       'Thứ 2',  '8:00 AM'],
        ['Excel',      'Thứ 4',  '9:00 AM'],
        ['PowerPoint', 'Thứ 6', '10:00 AM']]
	}},
// CÁCH 1C: Chọn Đoạn tiêu đề bằng Nháy đúp (Duple Click)
popupType: 'table-row-selection',
popupAnswer: {
    tableTitle: 'Bảng 1. Lịch học các môn tin học văn phòng',
    targetTitleWord: 'Lịch', 
    tableData: [        
        ['Môn học',    'Thứ',    'Giờ học'],
        ['Word',       'Thứ 2',  '8:00 AM'],
        ['Excel',      'Thứ 4',  '9:00 AM'],
        ['PowerPoint', 'Thứ 6', '10:00 AM']]
	}}, 
   ============================================================ */

function openTableSelectionPopup_62(step) {
    console.log(">>> Đã nhận lệnh mở Popup 62 thành công!", step);
    const box = _createPopupShell('Microsoft Word - Table Selection');
    const ans = step.popupAnswer || {};

    const tableTitleText = ans.tableTitle || '';

    /* Xác định mục tiêu đề bài */
    const ansTarget = ('targetTitleWord' in ans)
                    ? ('titleWord:' + ans.targetTitleWord)
                    : ('targetTitle' in ans)
                    ? 'title'
                    : ('targetWord' in ans)
                    ? ('word:' + ans.targetWord)
                    : ('targetTableRow' in ans) 
                    ? ('tableRow' + ans.targetTableRow) 
                    : 'table';

    const requiredSelectMode = ans.targetTitleSelectMode || 'any'; // 'tripleClick', 'click', 'any'

    window._pp62TableConfirmed = false;

    /* Tự động tạo câu hướng dẫn */
    let guideText = '';
    if (ansTarget === 'title') {
        if (requiredSelectMode === 'tripleClick') {
            guideText = '👉 Hãy <b>nháy chuột 3 lần (Triple Click)</b> để chọn toàn bộ Dòng tiêu đề.';
        } else {
            guideText = '👉 Hãy nhấp chọn <b>Dòng tiêu đề của Bảng</b> (văn bản phía trên bảng).';
        }
    } else if (ansTarget.indexOf('titleWord:') === 0) {
        const wordText = ansTarget.replace('titleWord:', '');
        guideText = '👉 Hãy <b>nháy đúp chuột (Double Click)</b> chọn từ <b>"' + wordText + '"</b> trong Dòng tiêu đề.';
    } else if (ansTarget === 'table') {
        guideText = '👉 Hãy chọn <b>toàn bộ Bảng</b> (Click nút 4 mũi tên ✢ ở góc trên bên trái Bảng)';
    } else if (ansTarget.indexOf('tableRow') === 0) {
        const rowNum = ansTarget.replace('tableRow', '');
        guideText = '👉 Hãy chọn <b>Dòng ' + rowNum + '</b> (Click vào lề trái Dòng ' + rowNum + ')';
    } else if (ansTarget.indexOf('word:') === 0) {
        const wordText = ansTarget.replace('word:', '');
        guideText = '👉 Hãy <b>nháy đúp chuột (Double Click)</b> chọn từ <b>"' + wordText + '"</b> trong Bảng.';
    } else {
        guideText = '👉 Hãy thực hiện thao tác chọn theo yêu cầu.';
    }

    var body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:540px;gap:0;padding:0;font-family:Arial,sans-serif;width:100%;box-sizing:border-box;';

    const hintBar = document.createElement('div');
    hintBar.style.cssText = 'font-size:13px;color:#374151;background:#f3f4f6;border-bottom:1px solid #d1d5db;padding:10px 16px;';
    hintBar.innerHTML = guideText;
    body.appendChild(hintBar);

    const doc = document.createElement('div');
    doc.style.cssText = 'padding:16px;background:#fff;width:100%;box-sizing:border-box;max-height:60vh;overflow-y:auto;';

/* ── DÒNG TIÊU ĐỀ MINH HỌA CHO BẢNG (HỖ TRỢ XUỐNG DÒNG \n VÀ CLICK/DBLCLICK) ── */
    let captionDiv = null;
    if (tableTitleText.trim() !== '') {
        captionDiv = document.createElement('div');
        // 🟢 Thêm white-space: pre-wrap để giữ nguyên các ký tự xuống dòng \n
        captionDiv.style.cssText = 'font-size:16px;font-weight:bold;color:#1e293b;margin-bottom:8px;line-height:1.4;cursor:pointer;padding:4px 6px;border-radius:4px;user-select:none;display:block;white-space:pre-wrap;';

        // Tách chuỗi theo dòng (\n) trước
        const titleLines = tableTitleText.split('\n');
        
        titleLines.forEach(function(lineText, li) {
            const lineDiv = document.createElement('div');
            lineDiv.style.cssText = 'display:block;';

            const titleWords = lineText.split(' ');
            titleWords.forEach(function(w, wi) {
                if (w === '') return;
                const spanWord = document.createElement('span');
                spanWord.textContent = w;
                spanWord.className = 'pp-title-word-span';
                spanWord.style.cssText = 'cursor:pointer;padding:1px 2px;border-radius:2px;display:inline-block;';

                // Nháy đúp chọn từ trong Tiêu đề
                spanWord.addEventListener('dblclick', function(e) {
                    e.stopPropagation();
                    _handleSelection('titleWord:' + w, spanWord, 'dblclick');
                });

                lineDiv.appendChild(spanWord);
                if (wi < titleWords.length - 1) lineDiv.appendChild(document.createTextNode(' '));
            });

            captionDiv.appendChild(lineDiv);
        });

        // Xử lý Click hoặc Triple Click vào Tiêu đề
        captionDiv.addEventListener('click', function(e) {
            e.stopPropagation();
            if (e.detail === 3) {
                _handleSelection('title', captionDiv, 'tripleClick');
            } else if (e.detail === 1) {
                _handleSelection('title', captionDiv, 'click');
            }
        });

        doc.appendChild(captionDiv);
    }

    /* Frame chứa Bảng */
    const tableOuterContainer = document.createElement('div');
    tableOuterContainer.style.cssText = 'position:relative;padding-top:22px;display:block;width:100%;box-sizing:border-box;margin:0;';

    const moveHandle = document.createElement('div');
    moveHandle.id = 'pp_bc_table_handle';
    moveHandle.title = 'Nhấp để chọn toàn bộ bảng';
    moveHandle.style.cssText = 'position:absolute;top:0px;left:0px;width:20px;height:20px;border:1px solid #2563eb;'
        + 'background:#eff6ff;color:#2563eb;display:none;align-items:center;justify-content:center;'
        + 'font-size:13px;font-weight:bold;cursor:pointer;border-radius:2px;z-index:10;';
    moveHandle.innerHTML = '✢';

    moveHandle.addEventListener('click', function(e) {
        e.stopPropagation();
        _handleSelection('table', null, 'click');
    });
    tableOuterContainer.appendChild(moveHandle);

    tableOuterContainer.addEventListener('mouseenter', function() { moveHandle.style.display = 'flex'; });
    tableOuterContainer.addEventListener('mouseleave', function() { moveHandle.style.display = 'none'; });

    var tblWrap = document.createElement('div');
    tblWrap.id = 'pp_bc_table';
    tblWrap.style.cssText = 'border:none;overflow-x:auto;transition:all 0.15s;width:100%;box-sizing:border-box;';

    var tableData = ans.tableData || [
        ['Môn học',    'Thứ',   'Giờ học'],
        ['Word',       'Thứ 2', '8:00 AM'],
        ['Excel',      'Thứ 4', '9:00 AM'],
        ['PowerPoint', 'Thứ 6', '10:00 AM']
    ];

    var mainTable = document.createElement('table');
    mainTable.style.cssText = 'border-collapse:collapse;empty-cells:show;width:100%;table-layout:fixed;font-size:14px;font-family:"Times New Roman",serif;margin:0;';

    tableData.forEach(function(rowData, ri) {
        var tr = document.createElement('tr');
        tr.id = 'pp_bc_row_' + (ri + 1);

        var marginTd = document.createElement('td');
        marginTd.style.cssText = 'width:30px;min-width:30px;max-width:30px;border:none!important;padding:0;text-align:center;vertical-align:middle;cursor:pointer;background:transparent;';
        
        var marginArrow = document.createElement('span');
        marginArrow.style.cssText = 'color:#2563eb;font-size:14px;font-weight:bold;visibility:hidden;display:inline-block;';
        marginArrow.innerHTML = '➔';
        marginTd.appendChild(marginArrow);

        tr.addEventListener('mouseenter', function() {
            marginArrow.style.visibility = 'visible';
            moveHandle.style.display = 'flex';
        });
        tr.addEventListener('mouseleave', function() {
            marginArrow.style.visibility = 'hidden';
        });

        marginTd.addEventListener('click', function(e) {
            e.stopPropagation();
            _handleSelection('tableRow' + (ri + 1), null, 'click');
        });

        tr.appendChild(marginTd);

        rowData.forEach(function(cellText) {
            var td = document.createElement(ri === 0 ? 'th' : 'td');
            td.className = 'pp-cell-data';
            td.style.cssText = 'border:1px solid #9ca3af;padding:8px 12px;text-align:left;overflow:hidden;text-overflow:ellipsis;min-height:36px;box-sizing:border-box;'
                + (ri === 0 ? 'background:#f1f5f9;font-weight:bold;' : 'background:#ffffff;');

            if (!cellText || cellText.trim() === '') {
                td.innerHTML = '&nbsp;';
            } else {
                var words = cellText.split(' ');
                words.forEach(function(w, wi) {
                    var span = document.createElement('span');
                    span.textContent = w;
                    span.className = 'pp-word-span';
                    span.style.cssText = 'cursor:pointer;padding:1px 2px;border-radius:2px;display:inline;user-select:none;';
                    
                    span.addEventListener('dblclick', function(e) {
                        e.stopPropagation();
                        _handleSelection('word:' + w, span, 'dblclick');
                    });

                    td.appendChild(span);
                    if (wi < words.length - 1) td.appendChild(document.createTextNode(' '));
                });
            }

            td.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!ans.targetWord && !ans.targetTitleWord) {
                    _handleSelection('cellContent', null, 'click');
                }
            });

            tr.appendChild(td);
        });

        mainTable.appendChild(tr);
    });

    tblWrap.appendChild(mainTable);
    tableOuterContainer.appendChild(tblWrap);
    doc.appendChild(tableOuterContainer);
    body.appendChild(doc);

    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_table_select';
    errDiv.style.cssText = 'margin:0 16px 8px 16px;';
    body.appendChild(errDiv);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #e2e8f0;background:#f8fafc;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    function _getZoneLabel(zone) {
        if (zone === 'title') return 'Dòng tiêu đề Bảng';
        if (zone.indexOf('titleWord:') === 0) return 'từ "' + zone.replace('titleWord:', '') + '" trong Tiêu đề';
        if (zone === 'table') return 'toàn bộ Bảng';
        if (zone.indexOf('tableRow') === 0) return 'Dòng ' + zone.replace('tableRow', '');
        if (zone.indexOf('word:') === 0) return 'từ "' + zone.replace('word:', '') + '"';
        return zone;
    }

    /* Kiểm tra đáp án */
    function _handleSelection(clickedZone, targetEl, clickType) {
        if (window._pp62TableConfirmed) return;

        if (clickedZone === ansTarget) {
            if (ansTarget === 'title' && requiredSelectMode === 'tripleClick' && clickType !== 'tripleClick') {
                _showPopupError('pp_err_table_select', '❌ Hãy nháy chuột 3 lần (Triple Click) để chọn toàn bộ Dòng tiêu đề.');
                return;
            }
            _highlightSelection(clickedZone, targetEl);
            showSuccess('✅ Chính xác! Bạn đã chọn đúng ' + _getZoneLabel(ansTarget) + '.');
        } else {
            if (clickedZone === 'cellContent') {
                _showPopupError('pp_err_table_select', '❌ Chưa chính xác! Bạn đã click vào ô nội dung.');
            } else {
                _showPopupError('pp_err_table_select', '❌ Chưa chính xác! Bạn đang chọn ' + _getZoneLabel(clickedZone) + '. Hãy chọn ' + _getZoneLabel(ansTarget) + '.');
            }
        }
    }

    /* Bôi xanh khi chọn đúng */
    function _highlightSelection(zone, targetEl) {
        if (zone === 'title') {
            if (targetEl) {
                targetEl.style.setProperty('background', '#2563eb', 'important');
                targetEl.style.setProperty('color', '#ffffff', 'important');
                targetEl.querySelectorAll('.pp-title-word-span').forEach(s => s.style.setProperty('color', '#ffffff', 'important'));
            }
        } else if (zone.indexOf('titleWord:') === 0 || zone.indexOf('word:') === 0) {
            if (targetEl) {
                targetEl.style.setProperty('background', '#2563eb', 'important');
                targetEl.style.setProperty('color', '#ffffff', 'important');
            }
        } else if (zone === 'table') {
            mainTable.querySelectorAll('.pp-cell-data').forEach(c => {
                c.style.setProperty('background', '#2563eb', 'important');
                c.style.setProperty('color', '#ffffff', 'important');
            });
        } else if (zone.indexOf('tableRow') === 0) {
            const rowEl = document.getElementById('pp_bc_row_' + zone.replace('tableRow', ''));
            if (rowEl) {
                rowEl.querySelectorAll('.pp-cell-data').forEach(c => {
                    c.style.setProperty('background', '#2563eb', 'important');
                    c.style.setProperty('color', '#ffffff', 'important');
                });
            }
        }
    }

    function showSuccess(msg) {
        window._pp62TableConfirmed = true;
        _hidePopupError('pp_err_table_select');
        hintBar.innerHTML = '<b>' + msg + '</b>';
        hintBar.style.background = '#dcfce7';
        hintBar.style.color = '#15803d';

        setTimeout(function() {
            closeMosPopup();
            if (typeof checkCorrect === 'function') checkCorrect();
            else if (typeof _checkPopupAnswer === 'function') _checkPopupAnswer(true);
        }, 500);
    }

    box.appendChild(body);
    box.style.width = '98%';
    box.style.maxWidth = 'none';

    setTimeout(function() {
        var overlay = box.closest('.mos-popup-overlay');
        if (overlay) {
            overlay.style.alignItems = 'flex-start';
            overlay.style.overflowY  = 'auto';
            overlay.style.paddingTop = '10px';
        }
    }, 0);
}

/* ============================================================
   POPUP 63. MÔ PHỎNG SECTION BREAK / PAGE BREAK VÀ THAO TÁC XÓA (DELETE)
// DẠNG 1: Đặt con trỏ đầu ngắt phần và nhấn phím DELETE để xóa
popupType: 'section-break',
popupAnswer: {
    doan1: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
    doan2: 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.',
    doan3: 'Các định dạng nâng cao giúp tối ưu hóa việc quản lý trang và phân đoạn văn bản.',
    breakLabel: 'Section Break (Next Page)',
    actionRequired: 'delete-break', 
    fontSize: {doan1: '14pt',doan2: '14pt',doan3: '14pt',breakLine: '14pt'}
	}},

// DẠNG 2: Chỉ yêu cầu nhấp chuột chọn đầu dòng ngắt phần
popupType: 'section-break',
popupAnswer: {
    doan1: 'Đoạn văn bản 1...',
    doan2: 'Đoạn văn bản 2...',
    doan3: 'Đoạn văn bản 3...',
    breakLabel: 'Page Break',
    actionRequired: 'head-break', 
    fontSize: { doan1: '15px', doan2: '15px', doan3: '15px' }
	}},

   ============================================================ */
function openSectionBreakPopup(step) {
    const box = _createPopupShell('Microsoft Word');
    const ans = step.popupAnswer || {};

    // 1. Dữ liệu mặc định 3 đoạn văn & Nhãn ngắt phần
    const DEFAULT_DOAN1 = 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.';
    const DEFAULT_DOAN2 = 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.';
    const DEFAULT_DOAN3 = 'Các định dạng nâng cao giúp tối ưu hóa việc quản lý trang và phân đoạn văn bản.';

    const textDoan1 = (ans.doan1 || ans.textParagraph || DEFAULT_DOAN1).trim();
    const textDoan2 = (ans.doan2 || ans.textParagraph2 || DEFAULT_DOAN2).trim();
    const textDoan3 = (ans.doan3 || DEFAULT_DOAN3).trim();
    const breakLabel = ans.breakLabel || 'Section Break (Next Page)';

    // Yêu cầu mục tiêu: 'delete-break' (Xóa ngắt phần), 'head-break' (Chọn đầu ngắt phần), hoặc chọn đoạn
    const actionRequired = ans.actionRequired || 'delete-break';

    // 2. Kích thước chữ tùy chỉnh (linh động qua fontSize)
    const fs = ans.fontSize || {};
    const sizeDoan1 = fs.doan1 || '15px';
    const sizeDoan2 = fs.doan2 || '15px';
    const sizeDoan3 = fs.doan3 || '15px';
    const sizeBreak = fs.breakLine || '13px';

    window._pp63Confirmed = false;
    window._pp63BreakSelected = false; // Trạng thái đã chọn đúng đầu dòng ngắt phần chưa

    const body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:560px;gap:0;padding:0;font-family:Arial,sans-serif;width:100%;box-sizing:border-box;';

    /* ── THANH HƯỚNG DẪN (HINT BAR) ── */
    const hintBar = document.createElement('div');
    hintBar.id = 'pp63_hint_bar';
    hintBar.style.cssText = 'font-size:13px;color:#374151;background:#f3f4f6;border-bottom:1px solid #d1d5db;padding:10px 16px;';

    let guideText = '👉 Hãy <b>nhấp chuột vào đầu dòng Section Break</b> và nhấn phím <b>DELETE</b> để xóa ngắt phần.';
    if (actionRequired === 'head-break') {
        guideText = '👉 Hãy <b>nhấp chuột vào đầu dòng Section Break</b>: <b>"::::: ' + breakLabel + ' :::::"</b>';
    }
    hintBar.innerHTML = guideText;
    body.appendChild(hintBar);

    /* ── CONTAINER TÀI LIỆU (KHUNG TRANG WORD) ── */
    const docContainer = document.createElement('div');
    docContainer.style.cssText = 'padding:16px;background:#e2e8f0;width:100%;box-sizing:border-box;max-height:65vh;overflow-y:auto;';

    /* ============================================================
       TRANG 1 (PAGE 1)
       ============================================================ */
    const page1 = document.createElement('div');
    page1.style.cssText = 'border:1px solid #cbd5e1;border-radius:4px;padding:20px 24px 30px 24px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.06);position:relative;margin-bottom:0;';

    // (5) Đánh dấu Trang 1 hiển thị khi mở
    const page1Badge = document.createElement('div');
    page1Badge.style.cssText = 'position:absolute;bottom:8px;right:16px;font-size:11px;color:#94a3b8;font-weight:bold;user-select:none;';
    page1Badge.textContent = 'Page 1';
    page1.appendChild(page1Badge);

    // Common Text Style
    const baseTextStyle = 'line-height:1.5;color:#1e293b;padding:6px 8px;margin:2px 0;user-select:text;outline:none;white-space:pre-wrap;';

    // (1) Đoạn 1
    const elDoan1 = document.createElement('div');
    elDoan1.id = 'pp63_doan1';
    elDoan1.contentEditable = 'true';
    elDoan1.style.cssText = baseTextStyle + 'font-size:' + sizeDoan1 + ';';
    elDoan1.textContent = textDoan1;
    page1.appendChild(elDoan1);

    // (2) Dòng Ngắt Phần (Section Break Line)
    const breakWrapper = document.createElement('div');
    breakWrapper.id = 'pp63_break_wrapper';
    breakWrapper.style.cssText = 'margin:10px 0;padding:4px 8px;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:center;position:relative;';

    const breakLine = document.createElement('div');
    breakLine.id = 'pp63_break_line';
    breakLine.style.cssText = 'width:100%;border-bottom:2px dashed #64748b;text-align:center;line-height:0.1em;margin:10px 0 15px 0;';

    const breakSpan = document.createElement('span');
    breakSpan.style.cssText = 'background:#fff;padding:0 12px;color:#475569;font-weight:bold;letter-spacing:0.5px;font-size:' + sizeBreak + ';';
    breakSpan.textContent = ':::::::: ' + breakLabel + ' ::::::::';
    breakLine.appendChild(breakSpan);
    breakWrapper.appendChild(breakLine);

    // Vùng con trỏ nhấp nháy mô phỏng đầu dòng ngắt phần
    const caretHead = document.createElement('span');
    caretHead.id = 'pp63_caret_head';
    caretHead.style.cssText = 'display:none;width:2px;height:16px;background:#2563eb;margin-right:4px;animation:pp63Blink 1s infinite;position:absolute;left:8px;top:50%;transform:translateY(-50%);';
    breakWrapper.appendChild(caretHead);

    page1.appendChild(breakWrapper);

    // (3) Đoạn 2 (dưới ngắt phần)
    const elDoan2 = document.createElement('div');
    elDoan2.id = 'pp63_doan2';
    elDoan2.contentEditable = 'true';
    elDoan2.style.cssText = baseTextStyle + 'font-size:' + sizeDoan2 + ';';
    elDoan2.textContent = textDoan2;
    page1.appendChild(elDoan2);

    docContainer.appendChild(page1);

    /* (4) KÍ HIỆU NGĂN CÁCH TRANG 1 & TRANG 2 */
    const pageSeparator = document.createElement('div');
    pageSeparator.style.cssText = 'height:24px;background:#cbd5e1;margin:0;display:flex;align-items:center;justify-content:center;border-left:1px solid #94a3b8;border-right:1px solid #94a3b8;';
    pageSeparator.innerHTML = '<span style="font-size:10px;color:#64748b;font-weight:bold;letter-spacing:2px;">— PAGE BREAK SEPARATOR —</span>';
    docContainer.appendChild(pageSeparator);

    /* ============================================================
       TRANG 2 (PAGE 2) — KHÔNG HIỂN THỊ SỐ TRANG
       ============================================================ */
    const page2 = document.createElement('div');
    page2.style.cssText = 'border:1px solid #cbd5e1;border-radius:4px;padding:20px 24px 30px 24px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.06);margin-top:0;';

    // (6) Đoạn 3 đầu Trang 2
    const elDoan3 = document.createElement('div');
    elDoan3.id = 'pp63_doan3';
    elDoan3.contentEditable = 'true';
    elDoan3.style.cssText = baseTextStyle + 'font-size:' + sizeDoan3 + ';';
    elDoan3.textContent = textDoan3;
    page2.appendChild(elDoan3);

    docContainer.appendChild(page2);
    body.appendChild(docContainer);

    /* ── VÙNG THÔNG BÁO LỖI ── */
    const errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp_err_sec_break';
    errDiv.style.cssText = 'margin:0 16px 8px 16px;';
    body.appendChild(errDiv);

    /* ── NÚT CANCEL ── */
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #e2e8f0;background:#f8fafc;';
    btnRow.innerHTML = '<button class="pp-btn pp-btn-cancel" onclick="closeMosPopup()">Cancel</button>';
    body.appendChild(btnRow);

    /* CSS ANIMATION CHO CON TRỎ NHẤP NHÁY */
    if (!document.getElementById('pp63_style')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'pp63_style';
        styleEl.textContent = '@keyframes pp63Blink { 0%,100%{opacity:1;} 50%{opacity:0;} }';
        document.head.appendChild(styleEl);
    }


/* ============================================================
       XỬ LÝ SỰ KIỆN TƯƠNG TÁC: CHỈ CHO PHÉP CHỌN ĐẦU DÒNG NGẮT PHẦN
       ============================================================ */

    // A. Bắt sự kiện Click trên dòng Ngắt Phần (CHỈ CHO PHÉP CHỌN ĐẦU DÒNG)
    breakWrapper.addEventListener('click', function(e) {
        if (window._pp63Confirmed) return;
        e.stopPropagation();

        // Tính khoảng cách tọa độ Click so với mép bên trái của khung ngắt phần
        const rect = breakWrapper.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        // BẮT BỘC: Chỉ chấp nhận vị trí click nằm trong khoảng 50px đầu tiên ở mép trái
        if (clickX > 50) {
            window._pp63BreakSelected = false;
            caretHead.style.display = 'none';
            breakWrapper.style.background = 'transparent';
            _showPopupError('pp_err_sec_break', '❌ Sai vị trí! Bạn phải nhấp chuột vào ĐẦU DÒNG Section Break (mép sát bên trái).');
            return;
        }

        // Đã click ĐÚNG đầu dòng ngắt phần
        _hidePopupError('pp_err_sec_break');
        window._pp63BreakSelected = true;

        // Bật con trỏ nhấp nháy ở đầu dòng
        caretHead.style.display = 'block';
        breakWrapper.style.background = '#eff6ff';
        breakWrapper.style.borderRadius = '4px';

        if (actionRequired === 'head-break') {
            showSuccess('✅ Chính xác! Bạn đã đặt con trỏ chuột tại vị trí đầu dòng Section Break.');
        } else {
            hintBar.innerHTML = '👉 Bạn đã đặt con trỏ đầu dòng! Hãy nhấn phím <b>DELETE</b> trên bàn phím để xóa ngắt phần.';
            hintBar.style.background = '#fef3c7';
            hintBar.style.color = '#92400e';
        }
    });

    // B. Lắng nghe sự kiện bàn phím (Phím DELETE)
    function handleKeyDown(e) {
        if (window._pp63Confirmed) return;

        if (e.key === 'Delete' || e.keyCode === 46) {
            if (actionRequired === 'delete-break') {
                if (window._pp63BreakSelected) {
                    // Xóa dòng ngắt phần khỏi giao diện
                    breakWrapper.style.display = 'none';

                    // Đẩy Đoạn 2 nối tiếp lên
                    elDoan2.style.marginTop = '0px';

                    showSuccess('✅ Chính xác! Bạn đã nhấn DELETE để xóa Section Break.');
                } else {
                    _showPopupError('pp_err_sec_break', '❌ Bạn cần nhấp chuột chọn đầu dòng Section Break trước khi nhấn Delete.');
                }
            }
        }
    }

    window.addEventListener('keydown', handleKeyDown);

    // C. Khi nhấp chuột ra ngoài các đoạn văn khác
    [elDoan1, elDoan2, elDoan3].forEach(function(el) {
        el.addEventListener('focus', function() {
            if (window._pp63Confirmed) return;
            window._pp63BreakSelected = false;
            caretHead.style.display = 'none';
            breakWrapper.style.background = 'transparent';
        });
    });

    // D. Hàm hoàn thành bài tập
    function showSuccess(msg) {
        window._pp63Confirmed = true;
        _hidePopupError('pp_err_sec_break');
        hintBar.innerHTML = '<b>' + msg + '</b>';
        hintBar.style.background = '#dcfce7';
        hintBar.style.color = '#15803d';

        window.removeEventListener('keydown', handleKeyDown);

        setTimeout(function() {
            closeMosPopup();
            if (typeof checkCorrect === 'function') {
                checkCorrect();
            } else if (typeof _checkPopupAnswer === 'function') {
                _checkPopupAnswer(true);
            }
        }, 600);
    }

    // Cleanup khi đóng Popup
    const origClose = window.closeMosPopup;
    window.closeMosPopup = function() {
        window.removeEventListener('keydown', handleKeyDown);
        if (typeof origClose === 'function') origClose();
    };

box.appendChild(body);

    // 🟢 THÊM ĐOẠN NÀY: Xử lý cuộn toàn bộ Popup 63 trên lớp nền overlay
    const overlay63 = box.closest('.mos-popup-overlay');
    if (overlay63) {
        overlay63.style.alignItems = 'flex-start';
        overlay63.style.overflowY = 'auto';
        overlay63.style.paddingTop = '14px';
    }

    // Tự động căn chỉnh kích thước chữ tiêu chuẩn 14px cho các thành phần điều khiển
    body.querySelectorAll('label,input,select,button').forEach(el => {
        el.style.fontSize = '14px';
    });

    box.style.width = '98%';
    box.style.maxWidth = 'none';
}


/* ============================================================
   64. POPUP CHỌN ĐOẠN VĂN BẢN — VẼ TRỰC TIẾP VÀO VÙNG 2 (#wordDocBody)
   popupType: 'text-selection-64'   (hàm xử lý: openPageSelect64)
   Không mở hộp thoại: vẽ nội dung trang vào vùng 2 của khung simulator.
   Bổ sung 5 thành phần: dòng 1, đoạn 1, dòng 2, đoạn 2, tiêu đề bảng.
   Giữ lại các chức năng chọn đoạn và định dạng hiện có.
	Chức năng:\t hoặc \n\t, chọn vị trí, chọn dòng trống.

//nháy 3 lần chọn đoạn
popupType: 'text-selection-64',
popupAnswer: {
    lineAboveText: 'Dự án MOS V31',
    textParagraph: 'GROUP WRITING PROJECT',
    lineBelowText: 'Dự án MOS V3',
    textParagraph2: 'Change the view of the “Data” worksheet to Page Break Preview. Drag the page break between columns E and F to immediately after column F.',
    tableTitle: 'Bảng thống kê kết quả',
    isDoubleClick: false,
    isTripleClick: true,
    isDrag: false,
    fontSize: {doan1: '18pt',doan2: '14pt',tableTitle: '14pt'}
	}},

//chọn vị trí trước/sau bất kì dòng nào.
popupType: 'text-selection-64',
popupAnswer: {
    lineAboveText: false,
    textParagraph: 'GROUP WRITING PROJECT',
    lineBelowText: false,
    textParagraph2: false,
    tableTitle: false,
    fontSize: {doan1: '18pt'},
    isDoubleClick: false,
    isTripleClick: false,
    isDrag: false,
    interaction: {target: 'textParagraph',action: 'clickAfter',targetWord: 'WRITING'}
	}},
//chọn vị trí trước/sau bất kì dòng nào.
popupType: 'text-selection-64',
popupAnswer: {
    lineAboveText: false,
    textParagraph: 'Nội dung đoạn 1',
    lineBelowText: 'ABC',
    textParagraph2: 'Nội dung đoạn 2',
    tableTitle: false,
    interaction: {target: 'lineBelowText',action: 'clickBefore',targetWord: 'ABC'},
    endInteraction: {after: 'insertPicture'}
	}},

//Nháy chọn dòng trống
popupType: 'text-selection-64',
popupAnswer: {
    lineAboveText: false,
    textParagraph: 'Nội dung đoạn 1',
    lineBelowText: false,
    textParagraph2: 'Nội dung đoạn 2',
    tableTitle: false,
    fontSize: {dong1: '14pt',doan1: '14pt',dong2: '14pt',doan2: '14pt',tableTitle: '14pt'},
    interaction: {target: 'lineBelowText',action: 'clickBefore'},
    endInteraction: {after: 'insertPicture'}
    }},

//nháy đúp - chọn 1 từ
popupType: 'text-selection-64',
popupAnswer: {
    lineAboveText: false,
    textParagraph: 'GROUP WRITING PROJECT',
    lineBelowText: false,
    textParagraph2: false,
    tableTitle: false,
    fontSize: {doan1: '18pt'},    isDoubleClick: true,    isTripleClick: false,    isDrag: false,
    interaction: {target: 'textParagraph',action: 'doubleClick',targetWord: 'WRITING'}
	}},

//kéo thả bất kì
popupType: 'text-selection-64',
popupAnswer: {
    lineAboveText: false,
    textParagraph: 'GROUP WRITING PROJECT',
    lineBelowText: false,
    textParagraph2: false,
    tableTitle: false,
    fontSize: {doan1: '18pt'},    isDoubleClick: false,    isTripleClick: false,    isDrag: true,
    interaction: {target: 'textParagraph',action: 'dragSelect',expectedText: 'GROUP WRITING'}
	}},


============================================================ */
function openPageSelect64(step) {
    var body = document.getElementById('wordDocBody');
    if (!body) return;
    // Giữ vùng chọn từ bước trước trong cùng một câu hỏi.
    var previousPageState = window._pageState;
    var currentPageQKey = currentProject + '-' + currentQuestion;
    var previousSelection =
        previousPageState &&
        previousPageState.qKey === currentPageQKey
            ? previousPageState.preservedSelection
            : null;
    var ans = step.popupAnswer || {};
    var fs = ans.fontSize || {};
    var interaction = ans.interaction || null;

    /*
     * Tương thích Answer của Popup 61/65:
     * chuyển targetParagraph/targetLine + isDrag/isDoubleClick/isTripleClick
     * sang cấu hình interaction dùng chung của Popup 64.
     * Answer có interaction khai báo trực tiếp vẫn được ưu tiên.
     */
    if (!interaction && (
        ans.isDrag === true ||
        ans.isDoubleClick === true ||
        ans.isTripleClick === true ||
        ans.targetParagraph ||
        ans.targetLine
    )) {
        var legacyTarget = ans.targetLine || ans.targetParagraph || 'main-text';
        var legacyTargetMap = {
            'line-above': 'lineAboveText',
            'line-below': 'lineBelowText',
            'main-text': 'textParagraph',
            'main-text-1': 'textParagraph',
            'main-text-2': 'textParagraph2',
            'table-title': 'tableTitle',
            'tableTitle': 'tableTitle'
        };
        var legacyAction = ans.isTripleClick === true
            ? 'tripleClick'
            : ans.isDoubleClick === true
                ? 'doubleClick'
                : ans.isDrag === true
                    ? 'dragSelect'
                    : 'click';
        interaction = {
            target: legacyTargetMap[legacyTarget] || 'textParagraph',
            action: legacyAction,
            expectedText: ans.expectedText || (ans.isDrag === true
                ? (ans.targetParagraph === 'main-text-2'
                    ? ans.textParagraph2
                    : (Array.isArray(ans.lines)
                        ? ans.lines.map(function (item) { return item && item.text != null ? String(item.text) : ''; }).join(' ')
                        : ans.textParagraph))
                : undefined),
            targetWord: ans.targetWord
        };
    }

    function norm(s) {
        return String(s == null ? '' : s)
            .replace(/[\r\n\t\u00A0]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    		}
    var targetIds = {
        lineAboveText: 'pp64_above',
        textParagraph: 'pp64_para',
        lineBelowText: 'pp64_below',
        textParagraph2: 'pp64_para2',
        tableTitle: 'pp64_tableTitle'
    	};
    var targetId = interaction && targetIds[interaction.target]
        ? targetIds[interaction.target]
        : null;
window._pageState = {
    qKey: currentPageQKey,
	above: ans.lineAboveText === false ||
       (typeof ans.lineAboveText === 'string' &&
        ans.lineAboveText.trim().toLowerCase() === 'false')
    ? false : (ans.lineAboveText || 'ABC'),

para: ans.textParagraph === false ||
      (typeof ans.textParagraph === 'string' &&
       ans.textParagraph.trim().toLowerCase() === 'false')
    ? false : (ans.textParagraph || (Array.isArray(ans.lines)
        ? ans.lines.map(function (item) { return item && item.text != null ? String(item.text) : ''; }).join(' ')
        : 'ABC')),

below: ans.lineBelowText === false ||
       (typeof ans.lineBelowText === 'string' &&
        ans.lineBelowText.trim().toLowerCase() === 'false')
    ? false : (ans.lineBelowText || 'ABC'),

para2: ans.hideParagraph2 === true || ans.textParagraph2 === false ||
       (typeof ans.textParagraph2 === 'string' &&
        ans.textParagraph2.trim().toLowerCase() === 'false')
    ? false : (ans.textParagraph2 || 'ABC'),

tableTitle: ans.tableTitle === false ||
            (typeof ans.tableTitle === 'string' &&
             ans.tableTitle.trim().toLowerCase() === 'false')
    ? false : (ans.tableTitle || 'ABC'),
        sizeAbove: fs.dong1 || '14pt',
        sizePara: fs.doan1 || '14pt',
        sizeBelow: fs.dong2 || '14pt',
        sizePara2: fs.doan2 || '14pt',
        sizeTableTitle: fs.tableTitle || '14pt',
        lines: Array.isArray(ans.lines) ? ans.lines : null,
	interactionTargetId: targetId,
	preservedSelection: previousSelection,
	selected: false,
        bold: false,
        italic: false,
        underline: false,
        align: '',
        color: ''
    		};
window.beginPageInteractionGroup(
        window._pageState.qKey,
        ans.endInteraction
    	);
    	if (typeof window.renderPageState === 'function') {
        window.renderPageState();
    	}
    var st = window._pageState;
    var isDebug = typeof debugMode !== 'undefined' && debugMode;
    var done = false;

    function wrong() {
        if (!done && !isDebug && typeof checkWrong === 'function') {
            checkWrong();
        }
	}

function getSelectedText() {
    var sel = window.getSelection ? window.getSelection() : null;
    return sel && !sel.isCollapsed ? norm(sel.toString()) : '';
}

function selectionInside(el) {
    var sel = window.getSelection ? window.getSelection() : null;
    if (!el || !sel || !sel.anchorNode || !sel.focusNode) return false;
    return el.contains(sel.anchorNode) && el.contains(sel.focusNode);
}

/* Tìm đúng thành phần đang chứa caret/vùng chọn, bất kể thao tác nào. */
function getSelectionElement() {
    var ids = [
        'pp64_above',
        'pp64_para',
        'pp64_below',
        'pp64_para2',
        'pp64_tableTitle'
    ];
    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el && selectionInside(el)) return el;
    }
    return null;
}

function success() {
    if (done || isDebug) return;

    /* Ưu tiên lưu phần tử đang thật sự chứa vùng chọn/caret. */
    var preserveEl = getSelectionElement();
    if (!preserveEl) {
        var preserveId = st.interactionTargetId || 'pp64_para';
        preserveEl = document.getElementById(preserveId);
    }
    if (preserveEl) saveSelectionState(preserveEl);

    done = true;
    st.selected = true;
    if (typeof closeMosPopup === 'function') closeMosPopup();
    if (typeof checkCorrect === 'function') checkCorrect();
}

/* Lưu vị trí caret hoặc vùng văn bản đang chọn */
function saveSelectionState(el) {
    var sel = window.getSelection();
    if (!el || !sel || !sel.rangeCount) return;

    var range = sel.getRangeAt(0);
    var anchorInside = !!(sel.anchorNode && el.contains(sel.anchorNode));
    var focusInside = !!(sel.focusNode && el.contains(sel.focusNode));

    /*
     * Một số trình duyệt mở rộng vùng chọn ba lần nháy qua ranh giới
     * phần tử. Khi đó lưu toàn bộ phần tử đích để không mất vùng chọn.
     */
    if (!anchorInside || !focusInside) {
        st.preservedSelection = {
            targetId: el.id,
            startOffset: 0,
            endOffset: (el.textContent || '').length,
            collapsed: false
        };
        return;
    }

    function getOffset(node, offset) {
        var r = document.createRange();
        r.selectNodeContents(el);
        r.setEnd(node, offset);
        return r.toString().length;
    }

    st.preservedSelection = {
        targetId: el.id,
        startOffset: getOffset(range.startContainer, range.startOffset),
        endOffset: getOffset(range.endContainer, range.endOffset),
        collapsed: range.collapsed
    };
}
/*
     * Lấy vị trí con trỏ theo tọa độ nhấp chuột.
     * Dùng vị trí caret thật, không chỉ dựa vào việc nhấp
     * ở bên trong phần tử.
*/
function caretAtPoint(e) {
        var range = null;
        if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(e.clientX, e.clientY);
        } else if (document.caretPositionFromPoint) {
            var pos = document.caretPositionFromPoint(e.clientX, e.clientY);
            if (pos) {
                range = document.createRange();
                range.setStart(pos.offsetNode, pos.offset);
                range.collapse(true);
            		}
        					}
        return range;
}
function caretOffsetIn(el, e) {
        var range = caretAtPoint(e);
        if (!range || !el.contains(range.startContainer)) return null;
        try {
            var before = document.createRange();
            before.selectNodeContents(el);
            before.setEnd(range.startContainer, range.startOffset);
            return before.toString().length;
        } catch (err) {
            return null;
        		}
}

/*
     * clickBefore/clickAfter:
     * chỉ nhận vị trí sát mép từ, không nhận khoảng trắng
     * giữa các từ.
*/
function placeCaretAtWordEdge(el, action, word, clickEvent) {
    word = String(word || '');
    if (!word) return false;
    var walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_TEXT,
        null
    	);
    var nodes = [];
    var fullText = '';
    var node;
    while ((node = walker.nextNode())) {
        nodes.push({
            node: node,
            start: fullText.length,
            end: fullText.length + node.nodeValue.length
        });
        fullText += node.nodeValue;
}
    var index = fullText.indexOf(word);
    if (index < 0) return false;

/* Xác định vị trí caret thật tại điểm người dùng nhấp */
    var rangeAtClick = null;
    if (document.caretRangeFromPoint) {
        rangeAtClick = document.caretRangeFromPoint(
            clickEvent.clientX,
            clickEvent.clientY
        );
    } else if (document.caretPositionFromPoint) {
        var pos = document.caretPositionFromPoint(
            clickEvent.clientX,
            clickEvent.clientY
        );
        if (pos) {
            rangeAtClick = document.createRange();
            rangeAtClick.setStart(pos.offsetNode, pos.offset);
            rangeAtClick.collapse(true);
        }
    }

    if (
        !rangeAtClick ||
        !el.contains(rangeAtClick.startContainer)
    ) {
        return false;
    }

/* Tính vị trí caret khi nhấp so với đầu thành phần */
    var beforeClick = document.createRange();
    beforeClick.selectNodeContents(el);
    beforeClick.setEnd(
        rangeAtClick.startContainer,
        rangeAtClick.startOffset
    );
    var clickedOffset = beforeClick.toString().length;

/* Vị trí đích: sát mép trái hoặc mép phải từ */
    var targetOffset = action === 'clickBefore'
        ? index
        : index + word.length;

/* Chỉ chấp nhận nhấp đúng vị trí đích */
    if (clickedOffset !== targetOffset) {
        return false;
    }

/* Tìm node văn bản chứa vị trí đích */
    for (var i = 0; i < nodes.length; i++) {
        var item = nodes[i];

        if (
            targetOffset >= item.start &&
            targetOffset <= item.end
        ) {
            var range = document.createRange();

            range.setStart(
                item.node,
                targetOffset - item.start
            );
            range.collapse(true);
            var sel = window.getSelection();
            if (!sel) return false;
            sel.removeAllRanges();
            sel.addRange(range);
            return true;
        }
    }
    return false;
}

/*
     * NHÁNH 1: tương tác mới.
     * Chỉ xử lý trên thành phần được khai báo trong interaction.target.
*/
    if (interaction && targetId) {
        var targetEl = document.getElementById(targetId);
        if (!targetEl) return;
        var action = interaction.action || '';
        var targetWord = interaction.targetWord || '';
        var expected = norm(
            interaction.expectedText !== undefined
                ? interaction.expectedText
                : targetWord
        );

/*
         * Cho phép đặt caret trong thành phần trống nếu đó là mục tiêu.
         * Không thêm ký tự giả vào nội dung hiển thị.
*/
        if (
            (action === 'clickBefore' || action === 'clickAfter') &&
            !norm(targetEl.textContent)
        ) {
            targetEl.contentEditable = 'true';
        }
        targetEl.addEventListener('click', function (e) {
            if (done) return;
            if (action === 'clickBefore' || action === 'clickAfter') {
                setTimeout(function () {
                    if (done) return;
                    var text = targetEl.textContent || '';

/* Dòng trống: vị trí hợp lệ là đầu dòng. */
if (!norm(text)) {
    var offset = caretOffsetIn(targetEl, e);
    if (
        offset === 0 ||
        (window.getSelection &&
         window.getSelection().anchorNode === targetEl)
    ) {
        success();
    } else {
        wrong();
    }
    return;
}

	if (placeCaretAtWordEdge(targetEl, action, targetWord, e)) {
    	success();
	} else {
    	wrong();
	}
                }, 0);
} else if (action === 'tripleClick') {
    if (e.detail >= 3) {
        // Chờ trình duyệt hoàn tất bôi đen cả đoạn rồi mới lưu và chuyển bước.
        setTimeout(function () {
            if (done) return;
            // Không chặn chuyển bước chỉ vì vùng chọn vượt ranh giới phần tử.
            if (getSelectedText()) success();
        }, 30);
    } else if (action === 'click') {
        success();
    }
}
        });

        if (action === 'doubleClick') {
            targetEl.addEventListener('dblclick', function () {
                setTimeout(function () {
                    if (done) return;
                    var selected = getSelectedText();
                    if (
                        selectionInside(targetEl) &&
                        selected &&
                        (selected === norm(targetWord) ||
                         selected === expected)
                    ) {
                        success();
                    } else {
                        wrong();
                    }
                }, 30);
            });
        }

        if (action === 'dragSelect') {
            function verifyDrag() {
                if (done) return;
                var selected = getSelectedText();
                if (!selected) return;
                if (
                    selectionInside(targetEl) &&
                    selected === expected
                ) {
                    success();
                } else {
                    wrong();
                }
            }

            targetEl.addEventListener('mouseup', function () {
                setTimeout(verifyDrag, 30);
            });

            targetEl.addEventListener('touchend', function () {
                setTimeout(verifyDrag, 100);
            });
        }

/*
         * Nhấp vào thành phần khác không được tính đúng.
         * Không xử lý lại nếu sự kiện phát sinh bên trong mục tiêu.
*/
        body.addEventListener('click', function (e) {
            if (!targetEl.contains(e.target)) wrong();
        });
        return;
    }

/*
     * NHÁNH 2: tương thích cấu hình Popup 64 cũ.
     * Không có interaction thì giữ cách chọn đoạn 1 như trước.
*/
    var paraEl = document.getElementById('pp64_para');
    if (!paraEl) return;
    var expectedLegacy = norm(ans.expectedText || st.para);
    if (ans.isTripleClick === true) {
        paraEl.addEventListener('click', function (e) {
            if (done || e.detail < 3) return;
            // Đợi trình duyệt hoàn tất chọn cả đoạn trước khi lưu.
            setTimeout(function () {
                if (done) return;
                // Vùng chọn ba lần nháy có thể vượt ranh giới paraEl.
                if (getSelectedText()) success();
            }, 30);
        });
    } else if (ans.isDoubleClick === true) {
        paraEl.addEventListener('dblclick', function () {
            setTimeout(function () {
                var selected = getSelectedText();
                if (!selected) return;
                if (!ans.targetWord || selected === norm(ans.targetWord)) {
                    success();
                } else {
                    wrong();
                }
            }, 30);
        });
    } else if (ans.isDrag === true) {
        paraEl.addEventListener('mouseup', function () {
            setTimeout(function () {
                var selected = getSelectedText();
                if (!selected) return;
                if (selected === expectedLegacy) {
                    success();
                } else {
                    wrong();
                }
            }, 30);
        });
    } else {
        paraEl.addEventListener('click', success);
    }
    body.addEventListener('click', function (e) {
        if (!paraEl.contains(e.target)) wrong();
    });
}

/* =========================================================
   GIAI ĐOẠN 3: QUẢN LÝ NHÓM TƯƠNG TÁC POPUP 64
   ========================================================= */
window._pageInteractionGroup =
    window._pageInteractionGroup || null;
/* Khởi tạo nhóm tương tác từ answer.endInteraction */
window.beginPageInteractionGroup = function (qKey, config) {
    if (
        window._pageInteractionGroup &&
        window._pageInteractionGroup.qKey !== qKey
    ) {
        window._pageInteractionGroup = null;
    }
    if (!config || !config.after) return;
    var actions = Array.isArray(config.after)
        ? config.after
        : [config.after];
    window._pageInteractionGroup = {
        qKey: qKey,
        after: actions,
        ended: false
    };
};

/* Đánh dấu kết thúc khi thao tác đích đã thành công */
window.completePageInteraction = function (action) {
    var group = window._pageInteractionGroup;
    if (!group || group.ended) return false;
    var currentKey = currentProject + '-' + currentQuestion;
    if (group.qKey !== currentKey) return false;
    if (group.after.indexOf(action) === -1) {
        return false;
    }

    group.ended = true;
    var st = window._pageState;
    if (st && st.qKey === group.qKey) {
        st.interactionGroupEnded = true;
    }
    return true;
};

window.renderPageState = function () {
    var st = window._pageState;
    var body = document.getElementById('wordDocBody');
    if (!st || !body) return false;
    if (st.qKey !== (currentProject + '-' + currentQuestion)) {
        return false;
    }

    function mk(id, text, size, extra) {
        var d = document.createElement('div');
        if (id) d.id = id;
        d.textContent =
            text === null || typeof text === 'undefined' || text === false
                ? ''
                : String(text);
        d.style.cssText =
            'white-space:pre-wrap;' +
		'tab-size:4;' +
            'line-height:1.4;' +
            'margin:4px 0;' +
            'padding:2px 6px;' +
            'min-height:1.4em;' +
            'font-size:' + (size || '14pt') + ';' +
            (extra || '');
        return d;
    }

/*
 * false/null/undefined hoặc chuỗi "false":
 * Ẩn chữ nhưng vẫn tạo vùng tương tác.
 * Chuỗi rỗng: giữ vùng trống nếu là mục tiêu tương tác
 * hoặc alwaysShow = true.
*/
function appendText(id, text, size, extra, alwaysShow) {
    var isInteractionTarget = id === st.interactionTargetId;
    var hideText =
        text === false ||
        text === null ||
        typeof text === 'undefined' ||
        (
            typeof text === 'string' &&
            text.trim().toLowerCase() === 'false'
        );
    var displayText = hideText ? '' : String(text);
    var isEmpty = displayText.trim() === '';
    var isPreservedTarget = !!(
        st.preservedSelection &&
        st.preservedSelection.targetId === id
    );

    // Không bỏ phần tử đang giữ vùng chọn khi dựng lại tài liệu ở bước mới.
    if (
        isEmpty &&
        !alwaysShow &&
        !isInteractionTarget &&
        !hideText &&
        !isPreservedTarget
    ) {
        return;
    }
    var el = mk(
        id,
        displayText,
        size,
        extra
    );

// Dòng ẩn chữ vẫn giữ vị trí và có thể được click.
    if (hideText || (isEmpty && isInteractionTarget)) {
        el.style.minHeight = '1.8em';
        el.style.cursor = 'text';
        el.style.userSelect = 'text';
    }
    body.appendChild(el);
}
    body.innerHTML = '';
    body.style.minHeight = '140px';

/* Dòng 1 */
    appendText(
        'pp64_above',
        st.above,
        st.sizeAbove,
        '',
        false
    );

/* Đoạn 1 — giữ nguyên các hiệu ứng định dạng */
    var pStyle = '';
if (st.selected && st.interactionTargetId === 'pp64_para') {
    pStyle += 'background:#D9D9D9;';
	}
    if (st.bold)      pStyle += 'font-weight:bold;';
    if (st.italic)    pStyle += 'font-style:italic;';
    if (st.underline) pStyle += 'text-decoration:underline;';
    if (st.align)     pStyle += 'text-align:' + st.align + ';';
    if (st.color)     pStyle += 'color:' + st.color + ';';
    if (Array.isArray(st.lines) && st.lines.length) {
        var linesHost = document.createElement('div');
        linesHost.id = 'pp64_para';
        linesHost.style.cssText =
            'white-space:pre-wrap;' +
            'tab-size:4;' +
            'line-height:1.4;' +
            'margin:4px 0;' +
            'padding:2px 6px;' +
            'min-height:1.4em;' +
            'font-size:' + (st.sizePara || '14pt') + ';' +
            pStyle;
        st.lines.forEach(function (item) {
            item = item || {};
            var line = document.createElement('div');
            var indent = Number(item.indent) || 0;
            line.style.cssText = 'padding-left:' + Math.max(0, indent * 20) + 'px;white-space:pre-wrap;';
            line.textContent = item.text == null ? '' : String(item.text);
            linesHost.appendChild(line);
        });
        body.appendChild(linesHost);
    } else {
        appendText(
            'pp64_para',
            st.para,
            st.sizePara,
            pStyle,
            true
        );
    }

/* Dòng 2 */
    appendText(
        'pp64_below',
        st.below,
        st.sizeBelow,
        '',
        false
    );

/* Đoạn 2 */
    appendText(
        'pp64_para2',
        st.para2,
        st.sizePara2,
        '',
        false
    );

/* Tiêu đề bảng — chỉ hiển thị văn bản */
    appendText(
        'pp64_tableTitle',
        st.tableTitle,
        st.sizeTableTitle,
        '',
        false
    );

/*
     * Khôi phục caret/vùng chọn sau khi dựng lại nội dung.
     */
var saved = st.preservedSelection;
    if (saved && saved.targetId) {
        var target = document.getElementById(saved.targetId);
        if (target) {
            function rangeAtOffset(el, offset) {
                var range = document.createRange();
                var walker = document.createTreeWalker(
                    el,
                    NodeFilter.SHOW_TEXT,
                    null
                );
                var node;
                var remaining = Math.max(0, offset);
                var lastNode = null;
                while ((node = walker.nextNode())) {
                    lastNode = node;
                    if (remaining <= node.nodeValue.length) {
                        range.setStart(node, remaining);
                        range.collapse(true);
                        return range;
                    }
                    remaining -= node.nodeValue.length;
                }
                if (lastNode) {
                    range.setStart(
                        lastNode,
                        lastNode.nodeValue.length
                    );
                } else {
                    range.setStart(el, 0);
                }
                range.collapse(true);
                return range;
            }
            var startRange = rangeAtOffset(
                target,
                saved.startOffset
            );
            var sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                if (saved.collapsed) {
                    sel.addRange(startRange);
                } else {
                    var endRange = rangeAtOffset(
                        target,
                        saved.endOffset
                    );
                    var restored = document.createRange();
                    restored.setStart(
                        startRange.startContainer,
                        startRange.startOffset
                    );
                    restored.setEnd(
                        endRange.startContainer,
                        endRange.startOffset
                    );
                    sel.addRange(restored);
                }
            }
        }
    }
    return true;
};
/* Giữ lệnh vẽ lần đầu nếu mã hiện tại đang sử dụng */
window.renderPageState();

/* Vẽ lần đầu sau khi hàm renderPageState được khai báo */
window.renderPageState();

/* Áp hiệu ứng của bước (pageEffect) lên đoạn đang được chọn */
window.applyPageEffect = function (effect) {
    var st = window._pageState;
    if (!st || !effect) { return; }
    if (st.qKey !== (currentProject + '-' + currentQuestion)) {
        return;
    }
    if (!st.selected) { return; }
    if (effect.bold === true)      { st.bold = true; }
    if (effect.italic === true)    { st.italic = true; }
    if (effect.underline === true) { st.underline = true; }
    if (effect.align)              { st.align = effect.align; }
    if (effect.color)              { st.color = effect.color; }
    window.renderPageState();
};

/* ============================================================
   65. POPUP TEXT SELECTION (SỬA LỖI KHÔNG CHỌN ĐƯỢC INDEX)	
	//startIndex: không tính rổng + các từ giữa tính rỗng (Word là phần mềm 10-26), bắt đầu là 0, kí tự đầu là 1=M 
	//    hideParagraph2: true,   // ← MỚI: ẩn hẳn Đoạn 2, không hiện văn bản mặc định nữa

// 1. Kéo thả vị trí bất kì
popupType: 'text-selection-65',
popupAnswer: {
        lineAboveText: 'ABC',
        lineBelowText: 'MOS',
        textParagraph: 'Microsoft word',
	hideParagraph2: true,
        expectedText: 'word',
        isDrag: true,
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 2. Nháy đúp - chọn 1 từ
popupType: 'text-selection-65',
popupAnswer: {
        lineAboveText: 'ABC',
        lineBelowText: 'MOS',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
	hideParagraph2: true,
        isDoubleClick: true,
        isTripleClick: false,
        isDrag: false,
        targetWord: 'Word',
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 3. Nháy 3 lần - chọn Đoạn 1
popupType: 'text-selection-65',
popupAnswer: {
        lineAboveText: 'ABC',
        lineBelowText: '',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
	hideParagraph2: true,
        isDoubleClick: false,
        isTripleClick: true,
        isDrag: false,
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 4. Nháy chọn Dòng 1 (Dòng trống trên)
popupType: 'text-selection-65',
popupAnswer: {
        lineAboveText: ' ',
        targetLine: 'line-above',
	hideParagraph2: true, 
	fontSize: { dong1: '15pt', dong2: '15pt', doan1: '16pt', doan2: '16pt' }
	}},

// 5. Chọn Dòng 2 (Dòng trống dưới)
popupType: 'text-selection-65',
popupAnswer: {
        lineBelowText: ' ',
        targetLine: 'line-below',
	hideParagraph2: true,
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 6. Kéo thả chọn cụm từ ở Đoạn 2
popupType: 'text-selection-65',
    popupAnswer: {
        lineAboveText: 'ABC',
        lineBelowText: 'MOS',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
        textParagraph2: 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.',
	targetParagraph: 'main-text-2',
        isDrag: true,
        expectedText: 'xử lý tài liệu chuyên nghiệp',
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 7. Nháy đúp chọn 1 từ ở Đoạn 2
popupType: 'text-selection-65',
popupAnswer: {
	lineAboveText: '',
        lineBelowText: '',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
        textParagraph2: 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.',
        targetParagraph: 'main-text-2',
        isDoubleClick: true,
        targetWord: 'chuyên',
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 8. Mặc định chọn Đoạn 2 (2 Dòng tiêu đề rỗng)
popupType: 'text-selection-65',
popupAnswer: {
        lineAboveText: '',
        lineBelowText: '',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
        textParagraph2: 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.',
        targetParagraph: 'main-text-2',
        isTripleClick: true, 
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 9. Chọn Đoạn 1
popupType: 'text-selection-65',
popupAnswer: {
        lineAboveText: '',
        lineBelowText: 'MOS',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
	hideParagraph2: true,
        targetParagraph: 'main-text',
        isTripleClick: true,
        isDoubleClick: false,
        isDrag: false, 
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 10. Chọn Đoạn 2
popupType: 'text-selection-65',
popupAnswer: {
        lineAboveText: 'I. GIỚI THIỆU CHUNG',
        lineBelowText: 'II. HƯỚNG DẪN SỬ DỤNG',
        textParagraph: 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.',
        textParagraph2: 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.',
        targetParagraph: 'main-text-2',
        isTripleClick: true,
        isDoubleClick: false,
        isDrag: false, 
	fontSize: { dong1: '18pt', dong2: '18pt', doan1: '14pt', doan2: '14pt' }
	}},

// 11. dùng tab, kéo thả, Thụt 2 lần (Cấp 1), Thụt 3 lần (Cấp 2), có thể dùng nháy đúp
popupType: 'text-selection-65',
popupAnswer: {
    	isDrag: true,
    	targetParagraph: 'main-text',
    	expectedText: 'MOS Version 2013 Version 2016 IC3 Ethan Hawke',
	hideParagraph2: true,
    	lines: [
        	{ text: 'MOS', indent: 2 },            
        	{ text: 'Version 2013', indent: 3 },   
        	{ text: 'Version 2016', indent: 3 },   
        	{ text: 'IC3', indent: 2 },           
        	{ text: 'Ethan', indent: 2 },          
        	{ text: 'Hawke', indent: 2 }           
    		],
        lineAboveText: 'Courses of MOS',  
    	lineBelowText: '@MOS' }},

   ============================================================ */

function openTextSelectionPopup65(step) {
    // 1. Tự động chuẩn hóa dữ liệu đầu vào
    if (!step) step = {};
    if (!step.popupAnswer && (step.textParagraph || step.lines || step.expectedText || step.targetLine || step.targetParagraph)) {
        step = { popupAnswer: step };
    }

    /* Hàm chuẩn hóa chuỗi (Triệt tiêu ngắt dòng, tab, khoảng trắng rác) */
    function normalizeText(str) {
        if (!str) return '';
        return str.replace(/[\r\n\t\u00A0]+/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Khung Popup
    var box = typeof _createPopupShell === 'function'
        ? _createPopupShell('Microsoft Word')
        : createFallbackShell61('Microsoft Word');
    var ans = step.popupAnswer || {};

    // 2. Mặc định văn bản cho các Đoạn và Dòng minh họa / Dòng trống
    var DEFAULT_PARAGRAPH_1 = 'Microsoft Word là phần mềm soạn thảo văn bản phổ biến nhất hiện nay.';
    var DEFAULT_PARAGRAPH_2 = 'Ứng dụng cung cấp nhiều tính năng mạnh mẽ giúp người dùng xử lý tài liệu chuyên nghiệp.';
    var fs = ans.fontSize || {};
    var sizeLine1 = fs.dong1 || '18px';
    var sizeLine2 = fs.dong2 || '18px';
    var sizePara1 = fs.doan1 || '14px';
    var sizePara2 = fs.doan2 || '14px';
    var lineAboveText = (typeof ans.lineAboveText !== 'undefined') ? ans.lineAboveText : '';
    var lineBelowText = (typeof ans.lineBelowText !== 'undefined') ? ans.lineBelowText : '';

    // 3. Trích xuất văn bản đoạn từ Answer
    var rawPara1 = ans.textParagraph || ans.expectedText || '';
    var mainText1 = rawPara1.replace(/\u00A0/g, ' ').trim() || DEFAULT_PARAGRAPH_1;

    // Answer 11+: nếu khai báo "lines" mà chưa có textParagraph/expectedText,
    // tự ghép nội dung các dòng làm mainText1 dự phòng.
    if ((!rawPara1 || !rawPara1.trim()) && ans.lines && Array.isArray(ans.lines)) {
        mainText1 = ans.lines.map(function(item) { return item.text; }).join(' ');
    }

    var rawPara2 = ans.textParagraph2 || '';
    var mainText2 = rawPara2.replace(/\u00A0/g, ' ').trim() || DEFAULT_PARAGRAPH_2;

    // 4. Xác định đoạn mục tiêu
    var rawTarget = ans.targetParagraph || 'main-text';
    if (rawTarget === 'main-text-1') rawTarget = 'main-text';
    var targetParagraph = rawTarget;
    var currentTargetText = (targetParagraph === 'main-text-2') ? mainText2 : mainText1;

    // 5. Xác định chuỗi cần kiểm tra
    var expectedStart = (typeof ans.startIndex === 'number') ? ans.startIndex : null;
    var expectedEnd = (typeof ans.endIndex === 'number') ? ans.endIndex : null;
    var rawExpected = '';

    if (ans.expectedText) {
        rawExpected = ans.expectedText;
    } else if (expectedStart !== null && expectedEnd !== null) {
        rawExpected = currentTargetText.substring(expectedStart, expectedEnd);
    } else if (ans.targetWord) {
        rawExpected = ans.targetWord;
    } else if (ans.lines && Array.isArray(ans.lines)) {
        // Answer 11+: tự ghép đáp án từ các dòng nếu không có đáp án cụ thể.
        rawExpected = ans.lines.map(function(item) { return item.text; }).join(' ');
    } else {
        rawExpected = currentTargetText;
    }

    var expectedText = normalizeText(rawExpected);

    // 6. Cấu hình thao tác mục tiêu
    var rawTargetLine = ans.targetLine || targetParagraph;
    if (rawTargetLine === 'main-text-1') rawTargetLine = 'main-text';
    var correctTargetLine = rawTargetLine;
    var isDoubleClick = ans.isDoubleClick === true;
    var isTripleClick = ans.isTripleClick === true;
    var isDrag = ans.isDrag === true;

    window._pp65TextConfirmed = false;

    var body = document.createElement('div');
    body.className = 'mos-popup-body';
    body.style.cssText = 'min-width:520px;gap:0;padding:0;font-family:Arial,sans-serif;width:100%;box-sizing:border-box;';

    /* ── THANH HƯỚNG DẪN ── */
    var hintBar = document.createElement('div');
    hintBar.style.cssText = 'font-size:13px;color:#374151;background:#f3f4f6;border-bottom:1px solid #d1d5db;padding:10px 16px;';

    var actionGuide = '👉 Hãy thực hiện thao tác chọn vị trí hoặc bôi đen văn bản theo yêu cầu.';

    if (correctTargetLine === 'line-above') {
        actionGuide = '👉 Hãy <b>nhấp chuột vào dòng phía trên</b>: <b>"' + (lineAboveText.trim() || '[Dòng trống]') + '"</b>';
    } else if (correctTargetLine === 'line-below') {
        actionGuide = '👉 Hãy <b>nhấp chuột vào dòng ở giữa/dưới</b>: <b>"' + (lineBelowText.trim() || '[Dòng trống]') + '"</b>';
    } else if (isDoubleClick) {
        actionGuide = '👉 Hãy <b>nháy đúp chuột (Double-click)</b> vào từ: <b>"' + (expectedText || ans.targetWord) + '"</b>';
    } else if (isTripleClick) {
        actionGuide = '👉 Hãy <b>nháy chuột 3 lần (Triple-click)</b> để chọn toàn bộ đoạn văn bản yêu cầu.';
    } else if (isDrag) {
        actionGuide = '👉 Hãy <b>kéo thả chuột</b> để bôi đen: <b>"' + expectedText + '"</b>';
    }

    hintBar.innerHTML = actionGuide;
    body.appendChild(hintBar);

    /* ── VÙNG HIỂN THỊ CẤU TRÚC VĂN BẢN ── */
    var doc = document.createElement('div');
    doc.style.cssText = 'padding:16px;background:#fff;width:100%;box-sizing:border-box;max-height:60vh;overflow-y:auto;';

    var docFrame = document.createElement('div');
    docFrame.style.cssText = 'border:1px solid #cbd5e1;border-radius:4px;padding:16px;background:#fff;';

    var baseLineStyle = 'line-height:1.4;font-weight:bold;color:#334155;cursor:pointer;padding:4px 8px;margin:0px 0;user-select:text;display:block;min-height:14px;white-space:pre-wrap;';
    var baseTextStyle = 'line-height:1.4;color:#1f2937;cursor:text;white-space:pre-wrap;padding:6px 8px;margin:0px 0;user-select:text;';

    // 1. Dòng trên
    var lineAbove = document.createElement('div');
    lineAbove.className = 'pp-line-item';
    lineAbove.dataset.lineType = 'line-above';
    lineAbove.style.cssText = baseLineStyle + 'font-size:' + sizeLine1 + ';';
    lineAbove.textContent = lineAboveText;

    // 2. Đoạn văn 1
    var textContainer1 = document.createElement('div');
    textContainer1.id = 'pp65_text_container_1';
    textContainer1.dataset.lineType = 'main-text';
    textContainer1.style.cssText = baseTextStyle + 'font-size:' + sizePara1 + ';';

    // Answer 11+: render từng dòng riêng, có thụt lề.
    // Mỗi cấp indent tương ứng 20px.
    if (ans.lines && Array.isArray(ans.lines)) {
        ans.lines.forEach(function(item) {
            var lineDiv = document.createElement('div');
            var indentPx = (item.indent || 0) * 20;
            lineDiv.style.cssText = 'padding-left:' + indentPx + 'px;line-height:1.4;user-select:text;';
            lineDiv.textContent = item.text;
            textContainer1.appendChild(lineDiv);
        });
    } else {
        textContainer1.textContent = mainText1;
    }

    // 3. Dòng dưới / giữa
    var lineBelow = document.createElement('div');
    lineBelow.className = 'pp-line-item';
    lineBelow.dataset.lineType = 'line-below';
    lineBelow.style.cssText = baseLineStyle + 'font-size:' + sizeLine2 + ';';
    lineBelow.textContent = lineBelowText;

    // 4. Đoạn văn 2
    var textContainer2 = document.createElement('div');
    textContainer2.id = 'pp65_text_container_2';
    textContainer2.dataset.lineType = 'main-text-2';
    textContainer2.style.cssText = baseTextStyle + 'font-size:' + sizePara2 + ';';
    textContainer2.textContent = mainText2;

    docFrame.appendChild(lineAbove);
    docFrame.appendChild(textContainer1);
    docFrame.appendChild(lineBelow);

    // Ẩn đoạn văn 2 khi hideParagraph2:true
    if (ans.hideParagraph2 !== true) {
        docFrame.appendChild(textContainer2);
    }

    doc.appendChild(docFrame);
    body.appendChild(doc);

    /* ── VÙNG BÁO LỖI & NÚT ── */
    var errDiv = document.createElement('div');
    errDiv.className = 'pp-error';
    errDiv.id = 'pp65_err_text_select';
    errDiv.style.cssText = 'margin:0 16px 8px 16px;color:#dc2626;font-size:13px;font-weight:bold;';
    body.appendChild(errDiv);

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #e2e8f0;background:#f8fafc;';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'pp-btn pp-btn-cancel';
    btnCancel.textContent = 'Cancel';
    btnCancel.onclick = function() {
        if (typeof closeMosPopup === 'function') closeMosPopup();
    };

    btnRow.appendChild(btnCancel);
    body.appendChild(btnRow);

    /* ── XỬ LÝ LỖI DỰ PHÒNG ── */
    function displayError(msg) {
        if (typeof _showPopupError === 'function') {
            _showPopupError('pp65_err_text_select', msg);
        } else {
            errDiv.textContent = msg;
        }
    }

    function clearError() {
        if (typeof _hidePopupError === 'function') {
            _hidePopupError('pp65_err_text_select');
        } else {
            errDiv.textContent = '';
        }
    }

    /* ── PHÂN LUỒNG XỬ LÝ SỰ KIỆN ── */
    [lineAbove, lineBelow].forEach(function(lineEl) {
        lineEl.addEventListener('click', function() {
            if (window._pp65TextConfirmed) return;
            var clickedLineType = lineEl.dataset.lineType;

            if (clickedLineType === correctTargetLine) {
                showSuccess('✅ Chính xác! Bạn đã chọn đúng vị trí dòng yêu cầu.');
            } else {
                displayError('❌ Chưa đúng vị trí dòng theo yêu cầu đề bài.');
            }
        });
    });

    [textContainer1, textContainer2].forEach(function(containerEl) {
        var currentType = containerEl.dataset.lineType;

        if (isDoubleClick) {
            containerEl.addEventListener('dblclick', function() {
                if (window._pp65TextConfirmed) return;

                var sel = window.getSelection();
                var selectedText = sel ? normalizeText(sel.toString()) : '';

                if (currentType === targetParagraph && (selectedText === expectedText || selectedText === ans.targetWord)) {
                    showSuccess('✅ Chính xác! Bạn đã nháy đúp đúng từ yêu cầu.');
                } else if (currentType !== targetParagraph) {
                    displayError('❌ Bạn đang thao tác sai đoạn văn yêu cầu.');
                } else {
                    displayError('❌ Chưa đúng! Cần nháy đúp vào từ: "' + (expectedText || ans.targetWord) + '"');
                }
            });
        } else if (isTripleClick) {
            containerEl.addEventListener('click', function(e) {
                if (window._pp65TextConfirmed) return;

                if (e.detail === 3) {
                    if (currentType === targetParagraph) {
                        showSuccess('✅ Chính xác! Bạn đã nháy 3 lần chọn toàn bộ đoạn văn.');
                    } else {
                        displayError('❌ Bạn đã nháy 3 lần sai đoạn văn yêu cầu.');
                    }
                }
            });
        } else if (isDrag) {
            function processTextSelection() {
                if (window._pp65TextConfirmed) return;

                var sel = window.getSelection();
                if (!sel || sel.isCollapsed) return;

                var isInsideContainer = containerEl.contains(sel.anchorNode) || containerEl.contains(sel.focusNode);
                if (!isInsideContainer) return;

                var selectedText = normalizeText(sel.toString());
                if (!selectedText) return;

                if (currentType === targetParagraph && selectedText === expectedText) {
                    showSuccess('✅ Chính xác! Bạn đã bôi đen đúng văn bản.');
                } else if (currentType !== targetParagraph) {
                    displayError('❌ Bạn đang bôi đen ở sai đoạn văn yêu cầu.');
                } else {
                    displayError('❌ Chưa chính xác! Hãy kéo thả bôi đen đúng đoạn văn yêu cầu.');
                }
            }

            containerEl.addEventListener('mouseup', function() {
                setTimeout(processTextSelection, 30);
            });

            containerEl.addEventListener('touchend', function() {
                setTimeout(processTextSelection, 100);
            });
        }
    });

    function showSuccess(msg) {
        window._pp65TextConfirmed = true;
        clearError();
        hintBar.innerHTML = '<b>' + msg + '</b>';
        hintBar.style.background = '#dcfce7';
        hintBar.style.color = '#15803d';

        setTimeout(function() {
            if (typeof closeMosPopup === 'function') closeMosPopup();

            if (typeof checkCorrect === 'function') {
                checkCorrect();
            } else if (typeof _checkPopupAnswer === 'function') {
                _checkPopupAnswer(true);
            }
        }, 500);
    }

    box.appendChild(body);
    box.style.width = '98%';
    box.style.maxWidth = 'none';

    setTimeout(function() {
        var overlay = box.closest('.mos-popup-overlay');

        if (overlay) {
            overlay.style.alignItems = 'flex-start';
            overlay.style.overflowY = 'auto';
            overlay.style.paddingTop = '10px';
        }

        body.querySelectorAll('label,input,select,button').forEach(function(el) {
            el.style.fontSize = '14px';
        });
    }, 0);
}


/* ============================================================
   KẾT NỐI VỚI ENGINE MOS
============================================================ */
document.addEventListener('DOMContentLoaded', function(){
    const _origCheckCorrect = window.checkCorrect;
    let _popupJustClosed = false;

    window.checkCorrect = function(){
        if(typeof PROJECTS==='undefined'){_origCheckCorrect();return;}
        const q    = PROJECTS[currentProject][currentQuestion];
        const step = q && q.steps[currentStep];
        if(_popupJustClosed){
            _popupJustClosed = false;
            _origCheckCorrect();
            return;
        }
        if(step && step.popupType){
            openMosPopup(step);
            return;
        }
        _origCheckCorrect();
    };

    const _origClose = window.closeMosPopup;
    window.closeMosPopup = function(){
        _origClose();
        _popupJustClosed = true;
    };
console.log('[Mos2vung.js] Loaded OK — 9 popup types ready.');
});
