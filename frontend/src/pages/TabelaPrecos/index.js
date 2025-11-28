import React, { useEffect, useState } from 'react';
import '../Contratos/style.css';
import { FiTable } from 'react-icons/fi';
const parseTSVWithQuotes = (text) => {
  const rows = [];
  let inQuote = false;
  let field = '';
  let row = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (ch === '\t' && !inQuote) { row.push(field); field = ''; continue; }
    if (ch === '\n' && !inQuote) { row.push(field); rows.push(row); field = ''; row = []; continue; }
    if (ch === '\r') { continue; }
    field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).filter(r => r.length === headers.length).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = r[idx]; });
    return obj;
  });
};

const colunas = ['Tipo', 'Descrição', 'Valor Repasse', 'Tipo Veículo'];

const TabelaPrecos = () => {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/tabela-precos-text');
        const text = await res.text();
        const parsed = parseTSVWithQuotes(text);
        setDados(parsed);
      } catch (e) {
        console.error('Erro ao carregar tabela de preços:', e);
      }
    };
    load();
  }, []);

  return (
    <center>
      <div className="contratos-container">
        <div className="contratos-card">
          <div className="contratos-header">
            <div className="contratos-title">
              <FiTable className="contratos-icon" />
              <h1>Tabela de Preços</h1>
            </div>
          </div>
          <div className="contrato-content">
            <div className="table-responsive">
            <table className="precos-table">
              <thead>
                <tr>
                  {colunas.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dados.map((row, idx) => (
                  <tr key={idx}>
                    {colunas.map((c) => (
                      <td key={c} data-label={c} style={c === 'Informações' ? { whiteSpace: 'pre-line' } : undefined}>
                        {row[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </center>
  );
};

export default TabelaPrecos;
