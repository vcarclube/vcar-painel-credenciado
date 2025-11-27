import React from 'react';
import '../Contratos/style.css';
import { FiTable } from 'react-icons/fi';

const dados = [
  { 'Tipo': 'SUSPENSÃO', 'Descrição': 'ALINHAMENTO DE DIREÇÃO', 'Valor Serviço': 'R$ 150,00', 'Valor Repasse': 'R$ 30,00', 'Garantia Dias': '30', 'Limite Anual': 'Não Há', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 150,00\nRepasse: R$ 30,00', 'Tipo Veículo': 'SUV' },
  { 'Tipo': 'SUSPENSÃO', 'Descrição': 'ALINHAMENTO DE DIREÇÃO', 'Valor Serviço': 'R$ 100,00', 'Valor Repasse': 'R$ 25,00', 'Garantia Dias': '30', 'Limite Anual': 'Não Há', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 100,00\nRepasse: R$ 25,00', 'Tipo Veículo': 'PASSEIO' },
  { 'Tipo': 'FREIOS', 'Descrição': 'PASTILHA DE FREIO TRASEIRA (PAR)', 'Valor Serviço': 'R$ 200,00', 'Valor Repasse': 'R$ 60,00', 'Garantia Dias': '90', 'Limite Anual': '2x', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 200,00\nRepasse: R$ 60,00', 'Tipo Veículo': 'PASSEIO' },
  { 'Tipo': 'FREIOS', 'Descrição': 'PASTILHA DE FREIO TRASEIRA (PAR)', 'Valor Serviço': 'R$ 250,00', 'Valor Repasse': 'R$ 66,60', 'Garantia Dias': '90', 'Limite Anual': '2x', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 250,00\nRepasse: R$ 66,60', 'Tipo Veículo': 'SUV' },
  { 'Tipo': 'SUSPENSÃO', 'Descrição': 'RODÍZIO DE PNEUS', 'Valor Serviço': 'R$ 70,00', 'Valor Repasse': 'R$ 16,00', 'Garantia Dias': '90', 'Limite Anual': 'Não Há', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 70,00\nRepasse: R$ 16,00', 'Tipo Veículo': 'PASSEIO' },
  { 'Tipo': 'SUSPENSÃO', 'Descrição': 'RODÍZIO DE PNEUS', 'Valor Serviço': 'R$ 80,00', 'Valor Repasse': 'R$ 20,00', 'Garantia Dias': '90', 'Limite Anual': 'Não Há', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 80,00\nRepasse: R$ 20,00', 'Tipo Veículo': 'SUV' },
  { 'Tipo': 'PREVENTIVA DE MOTOR', 'Descrição': 'TROCA DE VELAS', 'Valor Serviço': 'R$ 140,00', 'Valor Repasse': 'R$ 38,00', 'Garantia Dias': '90', 'Limite Anual': '1x', 'Informações': 'Tempo Médio: 00:30\nServiço: R$ 140,00\nRepasse: R$ 38,00', 'Tipo Veículo': 'PASSEIO' },
  { 'Tipo': 'PREVENTIVA DE MOTOR', 'Descrição': 'TROCA DE VELAS', 'Valor Serviço': 'R$ 190,00', 'Valor Repasse': 'R$ 42,00', 'Garantia Dias': '90', 'Limite Anual': '1x', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 190,00\nRepasse: R$ 42,00', 'Tipo Veículo': 'SUV' },
  { 'Tipo': 'FREIOS', 'Descrição': 'DISCO DE FREIO DIANTEIRO (PAR)', 'Valor Serviço': 'R$ 190,00', 'Valor Repasse': 'R$ 65,00', 'Garantia Dias': '90', 'Limite Anual': '2x', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 190,00\nRepasse: R$ 65,00', 'Tipo Veículo': 'PASSEIO' },
  { 'Tipo': 'FREIOS', 'Descrição': 'DISCO DE FREIO DIANTEIRO (PAR)', 'Valor Serviço': 'R$ 220,00', 'Valor Repasse': 'R$ 72,00', 'Garantia Dias': '90', 'Limite Anual': '2x', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 220,00\nRepasse: R$ 72,00', 'Tipo Veículo': 'SUV' },
  { 'Tipo': 'PREVENTIVA DE MOTOR', 'Descrição': 'DIAGNÓSTICO ELETRÔNICO (SCANNER)', 'Valor Serviço': 'R$ 120,00', 'Valor Repasse': 'R$ 30,00', 'Garantia Dias': '90', 'Limite Anual': 'Não Há', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 120,00\nRepasse: R$ 30,00', 'Tipo Veículo': 'PASSEIO' },
  { 'Tipo': 'PREVENTIVA DE MOTOR', 'Descrição': 'DIAGNÓSTICO ELETRÔNICO (SCANNER)', 'Valor Serviço': 'R$ 150,00', 'Valor Repasse': 'R$ 33,00', 'Garantia Dias': '90', 'Limite Anual': 'Não Há', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 150,00\nRepasse: R$ 33,00', 'Tipo Veículo': 'SUV' },
  { 'Tipo': 'SUSPENSÃO', 'Descrição': 'TROCA DE PIVÔ DE SUSPENSÃO (UNIDADE)', 'Valor Serviço': 'R$ 100,00', 'Valor Repasse': 'R$ 30,00', 'Garantia Dias': '90', 'Limite Anual': 'Não Há', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 100,00\nRepasse: R$ 30,00', 'Tipo Veículo': 'PASSEIO' },
  { 'Tipo': 'SUSPENSÃO', 'Descrição': 'TROCA DE PIVÔ DE SUSPENSÃO (UNIDADE)', 'Valor Serviço': 'R$ 130,00', 'Valor Repasse': 'R$ 33,30', 'Garantia Dias': '90', 'Limite Anual': 'Não Há', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 130,00\nRepasse: R$ 33,30', 'Tipo Veículo': 'SUV' },
  { 'Tipo': 'FREIOS', 'Descrição': 'TROCA DE FLUIDO DE FREIO', 'Valor Serviço': 'R$ 110,00', 'Valor Repasse': 'R$ 28,00', 'Garantia Dias': '90', 'Limite Anual': '1x', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 110,00\nRepasse: R$ 28,00', 'Tipo Veículo': 'PASSEIO' },
  { 'Tipo': 'FREIOS', 'Descrição': 'TROCA DE FLUIDO DE FREIO', 'Valor Serviço': 'R$ 140,00', 'Valor Repasse': 'R$ 31,00', 'Garantia Dias': '90', 'Limite Anual': '1x', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 140,00\nRepasse: R$ 31,00', 'Tipo Veículo': 'SUV' },
  { 'Tipo': 'SUSPENSÃO', 'Descrição': 'MONTAGEM E DESMONTAGEM DE PNEUS (POR RODA)', 'Valor Serviço': 'R$ 35,00', 'Valor Repasse': 'R$ 10,00', 'Garantia Dias': '90', 'Limite Anual': 'Não Há', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 35,00\nRepasse: R$ 10,00', 'Tipo Veículo': 'PASSEIO' },
  { 'Tipo': 'SUSPENSÃO', 'Descrição': 'MONTAGEM E DESMONTAGEM DE PNEUS (POR RODA)', 'Valor Serviço': 'R$ 35,00', 'Valor Repasse': 'R$ 14,00', 'Garantia Dias': '90', 'Limite Anual': 'Não Há', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 35,00\nRepasse: R$ 14,00', 'Tipo Veículo': 'SUV' },
  { 'Tipo': 'PREVENTIVA DE MOTOR', 'Descrição': 'LIMPEZA DE BICOS INJETORES', 'Valor Serviço': 'R$ 160,00', 'Valor Repasse': 'R$ 50,00', 'Garantia Dias': '90', 'Limite Anual': '1x', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 160,00\nRepasse: R$ 50,00', 'Tipo Veículo': 'PASSEIO' },
  { 'Tipo': 'PREVENTIVA DE MOTOR', 'Descrição': 'LIMPEZA DE BICOS INJETORES', 'Valor Serviço': 'R$ 180,00', 'Valor Repasse': 'R$ 56,00', 'Garantia Dias': '90', 'Limite Anual': '1x', 'Informações': 'Tempo Médio: 02:00\nServiço: R$ 180,00\nRepasse: R$ 56,00', 'Tipo Veículo': 'SUV' }
];

const colunas = ['Tipo','Descrição','Tipo Veículo','Valor Serviço','Valor Repasse','Garantia Dias','Limite Anual','Informações'];

const TabelaPrecos = () => {

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
                      <td key={c} style={c === 'Informações' ? { whiteSpace: 'pre-line' } : undefined}>
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
