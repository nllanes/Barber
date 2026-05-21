export const ADMIN_STYLES = `
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
  h2 { font-size: 1.8rem; color: var(--text-light); }
  .btn-add { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--gold); color: var(--primary-dark); border: none; border-radius: 6px; font-family: 'Poppins', sans-serif; font-weight: 600; cursor: pointer; transition: background 0.3s; }
  .btn-add:hover { background: var(--gold-light); }
  .form-card { background: var(--secondary-dark); border: 1px solid rgba(200,169,126,0.15); border-radius: 10px; padding: 30px; margin-bottom: 25px; }
  .form-card h3 { font-size: 1.2rem; color: var(--gold); margin-bottom: 20px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .form-group { display: flex; flex-direction: column; margin-bottom: 15px; }
  label { font-size: 0.8rem; color: var(--gold); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
  input, select, textarea { padding: 10px 14px; background: var(--tertiary-dark); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; color: var(--text-light); font-family: 'Poppins', sans-serif; font-size: 0.9rem; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: var(--gold); }
  .form-actions { display: flex; gap: 10px; margin-top: 10px; }
  .btn-save { padding: 10px 25px; background: var(--gold); color: var(--primary-dark); border: none; border-radius: 6px; font-family: 'Poppins', sans-serif; font-weight: 600; cursor: pointer; }
  .btn-cancel { padding: 10px 25px; background: transparent; color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-family: 'Poppins', sans-serif; cursor: pointer; }
  .table-wrap { background: var(--secondary-dark); border-radius: 10px; border: 1px solid rgba(200,169,126,0.1); overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 14px 16px; font-size: 0.8rem; color: var(--gold); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(200,169,126,0.1); white-space: nowrap; }
  td { padding: 12px 16px; font-size: 0.9rem; color: var(--text-light); border-bottom: 1px solid rgba(255,255,255,0.03); }
  tr:hover { background: rgba(200,169,126,0.03); }
  tr.inactive { opacity: 0.5; }
  .desc-cell { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-muted); }
  .icon-preview { color: var(--gold); font-size: 22px; }
  .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; background: rgba(231,76,60,0.15); color: var(--danger); }
  .badge.active { background: rgba(46,204,113,0.15); color: var(--success); }
  .actions { display: flex; gap: 6px; }
  .icon-btn { padding: 6px; background: rgba(200,169,126,0.1); border: none; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
  .icon-btn .material-icons { font-size: 18px; color: var(--text-muted); }
  .icon-btn:hover { background: rgba(200,169,126,0.2); }
  .icon-btn:hover .material-icons { color: var(--gold); }
  .icon-btn.danger:hover { background: rgba(231,76,60,0.2); }
  .icon-btn.danger:hover .material-icons { color: var(--danger); }
  .img-thumb { width: 60px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(200,169,126,0.2); }
  .img-preview { margin-top: 8px; }
  .img-preview img { width: 100%; max-height: 150px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(200,169,126,0.2); }
  .avatar-cell { width: 50px; height: 50px; border-radius: 50%; background: rgba(200,169,126,0.15); display: flex; align-items: center; justify-content: center; border: 2px solid var(--gold); }
  .avatar-cell .material-icons { font-size: 24px; color: var(--gold); }
  .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .gallery-card { background: var(--secondary-dark); border: 1px solid rgba(200,169,126,0.1); border-radius: 10px; overflow: hidden; transition: all 0.3s ease; }
  .gallery-card:hover { border-color: var(--gold); }
  .gallery-card.inactive { opacity: 0.4; }
  .gallery-card img { width: 100%; height: 200px; object-fit: cover; }
  .gallery-card-body { padding: 15px; }
  .gallery-card-body h4 { font-size: 1rem; color: var(--text-light); margin-bottom: 4px; }
  .gallery-card-body p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px; }
  .gallery-card-actions { display: flex; gap: 6px; }
  .order-badge { background: rgba(200,169,126,0.15); color: var(--gold); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; }
  @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } .page-header { flex-direction: column; gap: 15px; align-items: flex-start; } }
`;
