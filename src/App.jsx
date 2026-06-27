import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabase.js";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const CATS = [
  'CPU','GPU','RAM','Placa-mãe','Armazenamento',
  'Fonte','Gabinete','Refrigeração','Monitor',
  'Teclado','Mouse','Headset','Periférico','Outros'
];

const CAT_ICON = {
  'CPU':'🔲','GPU':'🖥️','RAM':'💾','Placa-mãe':'🔌',
  'Armazenamento':'💿','Fonte':'⚡','Gabinete':'🗃️',
  'Refrigeração':'❄️','Monitor':'📺','Teclado':'⌨️',
  'Mouse':'🖱️','Headset':'🎧','Periférico':'🔧','Outros':'📦'
};

const STATUS = {
  want_to_buy: { label:'Quero Comprar', icon:'🛒', color:'#22d3ee', bg:'rgba(6,182,212,0.1)',   border:'rgba(6,182,212,0.25)' },
  purchased:   { label:'Comprado',      icon:'✅', color:'#34d399', bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.25)' },
  watching:    { label:'Observando',    icon:'👁',  color:'#fbbf24', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.25)' },
};

const SORTS = [
  {v:'name_asc', l:'Nome (A→Z)'},      {v:'name_desc',l:'Nome (Z→A)'},
  {v:'cur_desc', l:'Maior Preço Atual'},{v:'cur_asc', l:'Menor Preço Atual'},
  {v:'des_desc', l:'Maior Desejado'},  {v:'des_asc', l:'Menor Desejado'},
  {v:'dlt_desc', l:'Maior Diferença'}, {v:'dlt_asc', l:'Menor Diferença'},
];

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════

const uid   = () => `i${Date.now()}${Math.random().toString(36).slice(2,5)}`;
const money = v  => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(+v||0);
const num   = v  => parseFloat(v)||0;
const dlt   = i  => num(i.currentPrice) - num(i.desiredPrice);

// ═══════════════════════════════════════════════════════════════
// SUPABASE DATA LAYER
// Mapeamento camelCase (app) ↔ snake_case (banco)
// ═══════════════════════════════════════════════════════════════

const toDB = item => ({
  id:            item.id,
  name:          item.name,
  brand:         item.brand   || null,
  category:      item.category,
  current_price: num(item.currentPrice),
  desired_price: num(item.desiredPrice),
  status:        item.status,
  link:          item.link    || null,
  notes:         item.notes   || null,
  created_at:    item.createdAt,
  updated_at:    item.updatedAt,
});

const fromDB = row => ({
  id:           row.id,
  name:         row.name,
  brand:        row.brand         || '',
  category:     row.category,
  currentPrice: row.current_price || 0,
  desiredPrice: row.desired_price || 0,
  status:       row.status,
  link:         row.link          || '',
  notes:        row.notes         || '',
  createdAt:    row.created_at,
  updatedAt:    row.updated_at,
});

const db = {
  async load() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(fromDB);
  },

  async upsert(item) {
    const { error } = await supabase
      .from('items')
      .upsert(toDB(item), { onConflict: 'id' });
    if (error) throw error;
  },

  async remove(id) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════

const C = {
  bg:      '#020617',
  surface: 'rgba(15,23,42,0.78)',
  panel:   'rgba(15,23,42,0.45)',
  border:  'rgba(51,65,85,0.55)',
  text:    '#e2e8f0',
  muted:   '#64748b',
};

const T = {
  body:    { minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,-apple-system,sans-serif' },
  input:   { background:'rgba(2,6,23,0.75)', border:'1px solid rgba(51,65,85,0.6)', borderRadius:8, padding:'8px 11px', color:'#e2e8f0', fontSize:13, outline:'none', width:'100%', boxSizing:'border-box', transition:'border 0.2s' },
  btn:     { borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.2s' },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16 },
  modal:   { background:'#0f172a', border:'1px solid rgba(51,65,85,0.85)', borderRadius:18, padding:'24px', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', animation:'slideUp 0.25s ease-out', boxShadow:'0 24px 64px rgba(0,0,0,0.75)' },
  label:   { color:C.muted, fontSize:10, fontWeight:700, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' },
};

// ═══════════════════════════════════════════════════════════════
// BASE COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Btn({ onClick, children, ghost, red, full, disabled, style: xStyle }) {
  const [h, setH] = useState(false);
  const bg = disabled
    ? 'rgba(51,65,85,0.3)'
    : ghost
      ? (h?'rgba(51,65,85,0.75)':'rgba(30,41,59,0.7)')
      : red
        ? (h?'#9f1239':'linear-gradient(135deg,#be123c,#9f1239)')
        : (h?'linear-gradient(135deg,#0284c7,#059669)':'linear-gradient(135deg,#0891b2,#059669)');
  return (
    <button onClick={disabled?undefined:onClick}
      onMouseEnter={()=>!disabled&&setH(true)}
      onMouseLeave={()=>setH(false)}
      style={{ ...T.btn, background:bg,
        border:ghost?`1px solid ${C.border}`:'none',
        color: disabled?'#475569':ghost?'#94a3b8':'#fff',
        boxShadow: disabled||ghost?'none':red?'0 2px 12px rgba(190,18,60,0.3)':'0 2px 16px rgba(6,182,212,0.3)',
        flex:full?1:undefined,
        cursor:disabled?'not-allowed':'pointer',
        opacity: disabled?0.6:1,
        ...(xStyle||{}) }}>
      {children}
    </button>
  );
}

function ActionBtn({ icon, onClick, hBg }) {
  const [h,setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ width:27, height:27, borderRadius:6, border:`1px solid ${C.border}`, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, transition:'all 0.15s',
        background:h?hBg:'rgba(30,41,59,0.9)', color:h?'#fff':'#94a3b8' }}>
      {icon}
    </button>
  );
}

function Badge({ status }) {
  const s = STATUS[status];
  return <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>{s.icon} {s.label}</span>;
}

// Toast de erro
function ErrorToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{ position:'fixed', bottom:20, right:20, zIndex:100, background:'rgba(190,18,60,0.95)', border:'1px solid rgba(239,68,68,0.5)', borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, animation:'slideUp 0.3s ease-out', boxShadow:'0 8px 24px rgba(0,0,0,0.5)', maxWidth:360 }}>
      <span style={{ fontSize:16 }}>⚠️</span>
      <span style={{ color:'#fff', fontSize:12, flex:1 }}>{message}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:16, lineHeight:1 }}>×</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════

function Header({ onAdd, onExport, count, saving }) {
  return (
    <header style={{ background:'rgba(2,6,23,0.92)', borderBottom:`1px solid ${C.border}`, backdropFilter:'blur(14px)', position:'sticky', top:0, zIndex:40 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, background:'linear-gradient(135deg,#0891b2,#059669)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, boxShadow:'0 0 22px rgba(6,182,212,0.45)', flexShrink:0 }}>⚡</div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:16, lineHeight:1 }}>TechStack Manager</div>
              {/* Badge Supabase */}
              <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:20, background:'rgba(62,207,142,0.15)', color:'#3ecf8e', border:'1px solid rgba(62,207,142,0.3)' }}>
                ⚡ Supabase
              </span>
            </div>
            <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>
              {saving ? '💾 Salvando...' : 'Gestão de Hardware & Periféricos'}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {count > 0 && <Btn ghost onClick={onExport}>📊 Exportar CSV</Btn>}
          <Btn onClick={onAdd} disabled={saving}>➕ Nova Peça</Btn>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════

function StatCard({ icon, label, value, sub, c, cbg, cbr }) {
  return (
    <div style={{ background:cbg, border:`1px solid ${cbr}`, borderRadius:12, padding:'14px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        <span style={{ fontSize:10, color:c, background:`${c}22`, border:`1px solid ${c}44`, borderRadius:20, padding:'2px 8px', fontWeight:700, whiteSpace:'nowrap' }}>{sub}</span>
      </div>
      <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{label}</div>
      <div style={{ color:c, fontSize:18, fontWeight:800 }}>{value}</div>
    </div>
  );
}

function Dashboard({ items }) {
  const totCur   = useMemo(()=>items.reduce((s,i)=>s+num(i.currentPrice),0),[items]);
  const totDes   = useMemo(()=>items.reduce((s,i)=>s+num(i.desiredPrice),0),[items]);
  const totDlt   = totCur - totDes;
  const purchVal = useMemo(()=>items.filter(i=>i.status==='purchased').reduce((s,i)=>s+num(i.currentPrice),0),[items]);
  const cnt      = k => items.filter(i=>i.status===k).length;

  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:10, marginBottom:10 }}>
        <StatCard icon="💰" label="Valor Total Atual"  value={money(totCur)}           sub={`${items.length} itens`}          c="#22d3ee" cbg="rgba(6,182,212,0.08)"   cbr="rgba(6,182,212,0.2)"   />
        <StatCard icon="🎯" label="Preço Desejado"     value={money(totDes)}           sub="Meta total"                       c="#34d399" cbg="rgba(16,185,129,0.08)"  cbr="rgba(16,185,129,0.2)"  />
        <StatCard icon={totDlt>0?'📉':'📈'} label="Δ Diferença" value={money(Math.abs(totDlt))} sub={totDlt>0?'a economizar':'abaixo da meta'}
          c={totDlt>0?'#fbbf24':'#f87171'} cbg={totDlt>0?'rgba(245,158,11,0.08)':'rgba(248,113,113,0.08)'} cbr={totDlt>0?'rgba(245,158,11,0.2)':'rgba(248,113,113,0.2)'} />
        <StatCard icon="🏆" label="Já Investido"       value={money(purchVal)}         sub={`${cnt('purchased')} comprados`}  c="#a78bfa" cbg="rgba(167,139,250,0.08)" cbr="rgba(167,139,250,0.2)" />
      </div>
      <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 16px', display:'flex', flexWrap:'wrap', gap:18 }}>
        {Object.entries(STATUS).map(([k,s])=>(
          <div key={k} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:s.color, flexShrink:0 }}/>
            <span style={{ color:'#94a3b8', fontSize:12 }}>{s.label}: <strong style={{ color:s.color }}>{cnt(k)}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FILTER BAR
// ═══════════════════════════════════════════════════════════════

function FilterBar({ f, setF, shown, total }) {
  const has = f.search||f.category||f.status;
  const sSty = { ...T.input, padding:'7px 10px', cursor:'pointer' };
  const iFocus = e => { e.target.style.borderColor='rgba(6,182,212,0.55)'; };
  const iBlur  = e => { e.target.style.borderColor='rgba(51,65,85,0.6)'; };

  return (
    <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:18 }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
        <div style={{ flex:'1 1 180px', position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:C.muted, fontSize:12, pointerEvents:'none' }}>🔍</span>
          <input style={{ ...T.input, paddingLeft:30 }} placeholder="Buscar nome, marca..." value={f.search}
            onChange={e=>setF(p=>({...p,search:e.target.value}))} onFocus={iFocus} onBlur={iBlur}/>
        </div>
        <select value={f.category} onChange={e=>setF(p=>({...p,category:e.target.value}))} style={sSty} onFocus={iFocus} onBlur={iBlur}>
          <option value="">Todas Categorias</option>
          {CATS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={f.status} onChange={e=>setF(p=>({...p,status:e.target.value}))} style={sSty} onFocus={iFocus} onBlur={iBlur}>
          <option value="">Todos Status</option>
          {Object.entries(STATUS).map(([k,s])=><option key={k} value={k}>{s.icon} {s.label}</option>)}
        </select>
        <select value={f.sort} onChange={e=>setF(p=>({...p,sort:e.target.value}))} style={sSty} onFocus={iFocus} onBlur={iBlur}>
          {SORTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      </div>
      {has && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
          <span style={{ color:C.muted, fontSize:11 }}>{shown} de {total} item(s)</span>
          <button onClick={()=>setF({search:'',category:'',status:'',sort:'name_asc'})}
            style={{ color:'#22d3ee', fontSize:11, background:'none', border:'none', cursor:'pointer' }}>
            Limpar filtros ×
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PART CARD
// ═══════════════════════════════════════════════════════════════

function PartCard({ item, onEdit, onDelete }) {
  const [hov, setHov] = useState(false);
  const d = dlt(item);
  const s = STATUS[item.status];
  const isPurchased = item.status === 'purchased';

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        background:C.surface, borderRadius:14, padding:'14px 16px', position:'relative', overflow:'hidden',
        border:`1px solid ${isPurchased?'rgba(52,211,153,0.38)':C.border}`,
        transition:'all 0.25s ease', transform:hov?'translateY(-2px)':'none',
        boxShadow: isPurchased
          ? `0 4px 24px rgba(52,211,153,${hov?0.18:0.08})`
          : hov?'0 6px 24px rgba(0,0,0,0.4)':'none',
      }}>
      {isPurchased && (
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% -20%,rgba(52,211,153,0.08),transparent 65%)', pointerEvents:'none' }}/>
      )}

      <div style={{ position:'absolute', top:10, right:10, display:'flex', gap:4, opacity:hov?1:0, transition:'opacity 0.2s' }}>
        <ActionBtn icon="✏️" onClick={()=>onEdit(item)} hBg="rgba(8,145,178,0.9)"/>
        <ActionBtn icon="🗑️" onClick={()=>onDelete(item.id)} hBg="rgba(190,18,60,0.9)"/>
      </div>

      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10, paddingRight:60 }}>
        <Badge status={item.status}/>
        <span style={{ fontSize:10, color:'#94a3b8', background:'rgba(51,65,85,0.5)', padding:'2px 8px', borderRadius:20 }}>
          {CAT_ICON[item.category]||'📦'} {item.category}
        </span>
      </div>

      <h3 style={{ color:'#f1f5f9', fontWeight:700, fontSize:13, margin:'0 0 2px', lineHeight:1.4 }}>{item.name}</h3>
      {item.brand && <p style={{ color:C.muted, fontSize:11, margin:'2px 0 0' }}>{item.brand}</p>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:5, marginTop:12 }}>
        {[
          {l:'Atual',    v:money(item.currentPrice), c:'#e2e8f0'},
          {l:'Desejado', v:money(item.desiredPrice), c:'#22d3ee'},
          {l:'Δ Diff',   v:(d!==0?(d>0?'−':'+'):'')+money(Math.abs(d)), c:d>0?'#fbbf24':d<0?'#f87171':C.muted},
        ].map(p=>(
          <div key={p.l} style={{ background:'rgba(2,6,23,0.6)', borderRadius:8, padding:'6px 4px', textAlign:'center' }}>
            <div style={{ color:'#475569', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{p.l}</div>
            <div style={{ color:p.c, fontWeight:700, fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.v}</div>
          </div>
        ))}
      </div>

      {item.notes && (
        <p style={{ color:C.muted, fontSize:11, marginTop:10, lineHeight:1.5, borderTop:`1px solid ${C.border}`, paddingTop:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {item.notes}
        </p>
      )}
      {item.link && (
        <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
          style={{ display:'inline-flex', alignItems:'center', gap:4, color:'#0891b2', fontSize:10, marginTop:8, textDecoration:'none' }}>
          🔗 Ver produto
        </a>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PART MODAL
// ═══════════════════════════════════════════════════════════════

const BLANK = { name:'', brand:'', category:'CPU', currentPrice:'', desiredPrice:'', status:'want_to_buy', link:'', notes:'' };

function PartModal({ item, onSave, onClose, saving }) {
  const [f,setF]     = useState(item?{...item,currentPrice:item.currentPrice||'',desiredPrice:item.desiredPrice||''}:BLANK);
  const [errs,setErrs] = useState({});
  const d = num(f.currentPrice) - num(f.desiredPrice);
  const set = k => e => { setF(p=>({...p,[k]:e.target.value})); setErrs({}); };
  const iFocus = e => { e.target.style.borderColor='rgba(6,182,212,0.55)'; };
  const iBlur  = e => { e.target.style.borderColor='rgba(51,65,85,0.6)'; };
  const eBorder = has => has?'rgba(239,68,68,0.6)':'rgba(51,65,85,0.6)';

  const submit = () => {
    const e={};
    if(!f.name.trim()) e.name='Nome é obrigatório';
    if(!f.currentPrice&&!f.desiredPrice) e.price='Informe pelo menos um preço';
    if(Object.keys(e).length){setErrs(e);return;}
    onSave({
      ...f,
      id: f.id || uid(),
      currentPrice: num(f.currentPrice),
      desiredPrice: num(f.desiredPrice),
      updatedAt: new Date().toISOString(),
      createdAt: f.createdAt || new Date().toISOString(),
    });
  };

  return (
    <div style={T.overlay} onClick={onClose}>
      <div style={T.modal} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ color:'#f1f5f9', fontWeight:800, fontSize:17, margin:0 }}>{f.id?'✏️ Editar Peça':'➕ Nova Peça'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.muted, fontSize:22, cursor:'pointer', lineHeight:1, padding:4 }}>×</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={T.label}>Nome do Produto *</label>
            <input placeholder="Ex: Core i9-14900K" value={f.name} onChange={set('name')} onFocus={iFocus} onBlur={iBlur}
              style={{...T.input, borderColor:eBorder(errs.name)}}/>
            {errs.name&&<span style={{color:'#f87171',fontSize:10,marginTop:4,display:'block'}}>{errs.name}</span>}
          </div>

          <div>
            <label style={T.label}>Marca / Fabricante</label>
            <input placeholder="Ex: Intel, NVIDIA, Corsair..." value={f.brand} onChange={set('brand')} onFocus={iFocus} onBlur={iBlur} style={T.input}/>
          </div>

          <div>
            <label style={T.label}>Categoria *</label>
            <select value={f.category} onChange={set('category')} onFocus={iFocus} onBlur={iBlur}
              style={{...T.input, padding:'8px 10px', cursor:'pointer'}}>
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={T.label}>Preço Atual (R$)</label>
              <input type="number" min="0" step="0.01" placeholder="0,00" value={f.currentPrice}
                onChange={set('currentPrice')} onFocus={iFocus} onBlur={iBlur}
                style={{...T.input, borderColor:eBorder(errs.price)}}/>
            </div>
            <div>
              <label style={T.label}>Preço Desejado (R$)</label>
              <input type="number" min="0" step="0.01" placeholder="0,00" value={f.desiredPrice}
                onChange={set('desiredPrice')} onFocus={iFocus} onBlur={iBlur}
                style={{...T.input, borderColor:eBorder(errs.price)}}/>
            </div>
          </div>
          {errs.price&&<span style={{color:'#f87171',fontSize:10,marginTop:-8}}>{errs.price}</span>}

          {(f.currentPrice||f.desiredPrice)&&(
            <div style={{ background:'rgba(2,6,23,0.65)', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px' }}>
              <span style={{ color:C.muted, fontSize:11 }}>Δ Diferença: </span>
              <strong style={{ fontSize:11, color:d>0?'#fbbf24':d<0?'#f87171':C.muted }}>
                {money(Math.abs(d))} {d>0?' (acima do desejado)':d<0?' (abaixo do desejado)':' (no valor desejado)'}
              </strong>
            </div>
          )}

          <div>
            <label style={T.label}>Status</label>
            <div style={{ display:'flex', gap:6 }}>
              {Object.entries(STATUS).map(([k,s])=>(
                <button key={k} onClick={()=>setF(p=>({...p,status:k}))}
                  style={{ flex:1, padding:'8px 4px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.2s',
                    background:f.status===k?s.bg:'rgba(15,23,42,0.6)',
                    color:f.status===k?s.color:C.muted,
                    border:`1px solid ${f.status===k?s.border:C.border}` }}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={T.label}>Link do Produto</label>
            <input type="url" placeholder="https://..." value={f.link} onChange={set('link')} onFocus={iFocus} onBlur={iBlur} style={T.input}/>
          </div>

          <div>
            <label style={T.label}>Observações</label>
            <textarea rows={3} placeholder="Notas, specs, comparações..." value={f.notes}
              onChange={set('notes')} onFocus={iFocus} onBlur={iBlur}
              style={{...T.input, resize:'none', lineHeight:1.6}}/>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, paddingTop:18, marginTop:18, borderTop:`1px solid ${C.border}` }}>
          <Btn ghost full onClick={onClose} disabled={saving}>Cancelar</Btn>
          <Btn full onClick={submit} disabled={saving}>
            {saving ? '💾 Salvando...' : f.id ? 'Salvar Alterações' : 'Adicionar Peça'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DELETE MODAL
// ═══════════════════════════════════════════════════════════════

function DeleteModal({ onConfirm, onClose, saving }) {
  return (
    <div style={T.overlay} onClick={onClose}>
      <div style={{...T.modal, maxWidth:360, textAlign:'center'}} onClick={e=>e.stopPropagation()}>
        <div style={{ width:52, height:52, background:'rgba(239,68,68,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 14px' }}>🗑️</div>
        <h3 style={{ color:'#f1f5f9', fontWeight:800, fontSize:16, margin:'0 0 8px' }}>Excluir Item?</h3>
        <p style={{ color:C.muted, fontSize:13, margin:'0 0 22px', lineHeight:1.5 }}>Esta ação não pode ser desfeita.</p>
        <div style={{ display:'flex', gap:10 }}>
          <Btn ghost full onClick={onClose} disabled={saving}>Cancelar</Btn>
          <Btn red full onClick={onConfirm} disabled={saving}>
            {saving ? '🗑️ Excluindo...' : 'Excluir'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════

function EmptyState({ onAdd, isFiltered }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', textAlign:'center' }}>
      <div style={{ width:68, height:68, background:C.panel, border:`1px solid ${C.border}`, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, marginBottom:16 }}>
        {isFiltered?'🔍':'🖥️'}
      </div>
      <h3 style={{ color:'#e2e8f0', fontWeight:800, fontSize:16, margin:'0 0 8px' }}>
        {isFiltered?'Nenhum item encontrado':'Seu Setup Começa Aqui'}
      </h3>
      <p style={{ color:C.muted, fontSize:13, maxWidth:290, lineHeight:1.7, margin:'0 0 20px' }}>
        {isFiltered
          ? 'Tente ajustar os filtros de busca.'
          : 'Adicione as peças e periféricos que deseja acompanhar. Controle preços, status e planeje o setup ideal.'}
      </p>
      {!isFiltered && <Btn onClick={onAdd}>➕ Adicionar Primeira Peça</Btn>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [modal,    setModal]    = useState(null);
  const [editing,  setEditing]  = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filters,  setFilters]  = useState({ search:'', category:'', status:'', sort:'name_asc' });

  // Carrega dados do Supabase na inicialização
  useEffect(() => {
    db.load()
      .then(data => { setItems(data); setLoading(false); })
      .catch(err  => { setError('Erro ao carregar dados: ' + err.message); setLoading(false); });
  }, []);

  // Lista filtrada e ordenada
  const filtered = useMemo(() => {
    let r = [...items];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      r = r.filter(i => [i.name,i.brand,i.notes].filter(Boolean).join(' ').toLowerCase().includes(q));
    }
    if (filters.category) r = r.filter(i=>i.category===filters.category);
    if (filters.status)   r = r.filter(i=>i.status===filters.status);

    const [field,dir] = filters.sort.split('_');
    r.sort((a,b) => {
      let va,vb;
      if      (field==='name') { va=a.name.toLowerCase(); vb=b.name.toLowerCase(); }
      else if (field==='cur')  { va=num(a.currentPrice);  vb=num(b.currentPrice); }
      else if (field==='des')  { va=num(a.desiredPrice);  vb=num(b.desiredPrice); }
      else if (field==='dlt')  { va=Math.abs(dlt(a));     vb=Math.abs(dlt(b)); }
      if (va < vb) return dir==='asc'?-1:1;
      if (va > vb) return dir==='asc'?1:-1;
      return 0;
    });
    return r;
  }, [items, filters]);

  // Handlers
  const openAdd    = () => { setEditing(null); setModal('form'); };
  const openEdit   = i  => { setEditing(i);    setModal('form'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  // Salvar (insert ou update) via Supabase
  const handleSave = async (item) => {
    setSaving(true);
    try {
      await db.upsert(item);
      setItems(prev =>
        prev.some(i => i.id === item.id)
          ? prev.map(i => i.id === item.id ? item : i)
          : [...prev, item]
      );
      closeModal();
    } catch (err) {
      setError('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Excluir via Supabase
  const confirmDelete = async () => {
    setSaving(true);
    try {
      await db.remove(deleting);
      setItems(prev => prev.filter(i => i.id !== deleting));
      setDeleting(null);
    } catch (err) {
      setError('Erro ao excluir: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Exportação CSV
  const exportCSV = () => {
    const h = ['Nome','Categoria','Marca','Preço Atual','Preço Desejado','Diferença','Status','Link','Observações'];
    const rows = items.map(i=>[
      i.name, i.category, i.brand||'', money(i.currentPrice), money(i.desiredPrice),
      money(dlt(i)), STATUS[i.status].label, i.link||'', i.notes||''
    ]);
    const csv = [h,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    Object.assign(document.createElement('a'),{
      href:'data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv),
      download:`techstack_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.csv`,
    }).click();
  };

  // Loading screen
  if (loading) return (
    <div style={{...T.body, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, background:'linear-gradient(135deg,#0891b2,#059669)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 12px', boxShadow:'0 0 24px rgba(6,182,212,0.45)' }}>⚡</div>
        <div style={{ color:C.muted, fontSize:13 }}>Conectando ao Supabase...</div>
      </div>
    </div>
  );

  return (
    <div style={T.body}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:none; } }
        * { box-sizing:border-box; }
        option { background:#0f172a; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(51,65,85,0.7); border-radius:4px; }
      `}</style>

      <Header onAdd={openAdd} onExport={exportCSV} count={items.length} saving={saving}/>

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'20px 20px 48px' }}>
        {items.length > 0 && <Dashboard items={items}/>}
        {items.length > 0 && (
          <FilterBar f={filters} setF={setFilters} shown={filtered.length} total={items.length}/>
        )}

        {filtered.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(265px,1fr))', gap:12 }}>
            {filtered.map(item => (
              <PartCard key={item.id} item={item} onEdit={openEdit} onDelete={id=>setDeleting(id)}/>
            ))}
          </div>
        ) : (
          <EmptyState isFiltered={items.length > 0} onAdd={openAdd}/>
        )}
      </main>

      {modal === 'form' && (
        <PartModal item={editing} onSave={handleSave} onClose={closeModal} saving={saving}/>
      )}
      {deleting && (
        <DeleteModal onConfirm={confirmDelete} onClose={()=>setDeleting(null)} saving={saving}/>
      )}
      {error && <ErrorToast message={error} onClose={()=>setError(null)}/>}
    </div>
  );
}
