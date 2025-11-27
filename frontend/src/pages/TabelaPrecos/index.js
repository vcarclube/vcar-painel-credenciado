import React, { useMemo, useState } from 'react';
import '../Contratos/style.css';
import { FiTable } from 'react-icons/fi';

const parseTSV = (text) => {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === '\r') continue;
    if (ch === '\t' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }
    if (ch === '\n' && !inQuotes) {
      row.push(field);
      rows.push(row);
      field = '';
      row = [];
      continue;
    }
    field += ch;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

const TabelaPrecos = () => {
  const tsv = `Tipo	Descrição	Valor Serviço	Valor Repasse	Garantia Dias	Limite Anual	Informações	Tipo Veículo
SUSPENSÃO	ALINHAMENTO DE DIREÇÃO	R$ 150,00	R$ 30,00	30	Não Há	"Tempo Médio: 02:00
Serviço: R$ 150,00
Repasse: R$ 30,00"	SUV
SUSPENSÃO	ALINHAMENTO DE DIREÇÃO	R$ 100,00	R$ 25,00	30	Não Há	"Tempo Médio: 02:00
Serviço: R$ 100,00
Repasse: R$ 25,00"	PASSEIO
SUSPENSÃO	ALINHAMENTO E BALANCEAMENTO	R$ 166,50	R$ 60,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 166,50
Repasse: R$ 60,00"	SUV
SUSPENSÃO	ALINHAMENTO E BALANCEAMENTO	R$ 150,00	R$ 50,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 150,00
Repasse: R$ 50,00"	PASSEIO
SUSPENSÃO	BALANCEAMENTO INDIVIDUAL (POR RODA)	R$ 20,00	R$ 8,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 20,00
Repasse: R$ 8,00"	PASSEIO
SUSPENSÃO	BALANCEAMENTO INDIVIDUAL (POR RODA)	R$ 20,00	R$ 10,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 20,00
Repasse: R$ 10,00"	SUV
SUSPENSÃO	DESEMPENO DE RODAS (POR RODA)	R$ 90,00	R$ 15,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 90,00
Repasse: R$ 15,00"	PASSEIO
SUSPENSÃO	DESEMPENO DE RODAS (POR RODA)	R$ 110,00	R$ 20,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 110,00
Repasse: R$ 20,00"	SUV
PREVENTIVA DE MOTOR	DIAGNÓSTICO ELETRÔNICO (SCANNER)	R$ 120,00	R$ 30,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 30,00"	PASSEIO
PREVENTIVA DE MOTOR	DIAGNÓSTICO ELETRÔNICO (SCANNER)	R$ 150,00	R$ 33,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 150,00
Repasse: R$ 33,00"	SUV
FREIOS	DISCO DE FREIO DIANTEIRO (PAR)	R$ 220,00	R$ 72,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 220,00
Repasse: R$ 72,00"	SUV
FREIOS	DISCO DE FREIO DIANTEIRO (PAR)	R$ 190,00	R$ 65,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 190,00
Repasse: R$ 65,00"	PASSEIO
FREIOS	DISCO DE FREIO TRASEIRO (PAR)	R$ 235,00	R$ 77,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 235,00
Repasse: R$ 77,00"	SUV
FREIOS	DISCO DE FREIO TRASEIRO (PAR)	R$ 210,00	R$ 70,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 210,00
Repasse: R$ 70,00"	PASSEIO
PREVENTIVA DE MOTOR	HIGIENIZAÇÃO DO AR-CONDICIONADO/SPRAY	R$ 120,00	R$ 10,00	45	Não Há	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 10,00"	PASSEIO
PREVENTIVA DE MOTOR	HIGIENIZAÇÃO DO AR-CONDICIONADO/SPRAY	R$ 150,00	R$ 11,00	45	Não Há	"Tempo Médio: 02:00
Serviço: R$ 150,00
Repasse: R$ 11,00"	SUV
PREVENTIVA DE MOTOR	LIMPEZA DE BICOS INJETORES	R$ 160,00	R$ 50,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 160,00
Repasse: R$ 50,00"	PASSEIO
PREVENTIVA DE MOTOR	LIMPEZA DE BICOS INJETORES	R$ 180,00	R$ 56,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 180,00
Repasse: R$ 56,00"	SUV
PREVENTIVA DE MOTOR	LIMPEZA DE TBI	R$ 160,00	R$ 60,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 160,00
Repasse: R$ 60,00"	SUV
PREVENTIVA DE MOTOR	LIMPEZA DE TBI	R$ 140,00	R$ 50,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 140,00
Repasse: R$ 50,00"	PASSEIO
PREVENTIVA DE MOTOR	LIMPEZA DO SISTEMA DE ARREFECIMENTO	R$ 230,00	R$ 65,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 230,00
Repasse: R$ 65,00"	SUV
PREVENTIVA DE MOTOR	LIMPEZA DO SISTEMA DE ARREFECIMENTO	R$ 190,00	R$ 60,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 190,00
Repasse: R$ 60,00"	PASSEIO
SUSPENSÃO	MONTAGEM E DESMONTAGEM DE PNEUS (POR RODA)	R$ 35,00	R$ 10,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 35,00
Repasse: R$ 10,00"	PASSEIO
SUSPENSÃO	MONTAGEM E DESMONTAGEM DE PNEUS (POR RODA)	R$ 35,00	R$ 14,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 35,00
Repasse: R$ 14,00"	SUV
ORÇAMENTO	ORÇAMENTO E AVALIAÇÃO	R$ 100,00	R$ 0,00	NÃO HÁ	Não Há	"Tempo Médio: 02:00
Serviço: R$ 100,00
Repasse: R$ 0,00"	PASSEIO
FREIOS	PASTILHA DE FREIO TRASEIRA (PAR)	R$ 200,00	R$ 60,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 200,00
Repasse: R$ 60,00"	PASSEIO
FREIOS	PASTILHA DE FREIO TRASEIRA (PAR)	R$ 250,00	R$ 66,60	90	2x	"Tempo Médio: 02:00
Serviço: R$ 250,00
Repasse: R$ 66,60"	SUV
SUSPENSÃO	RODÍZIO DE PNEUS	R$ 80,00	R$ 20,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 80,00
Repasse: R$ 20,00"	SUV
SUSPENSÃO	RODÍZIO DE PNEUS	R$ 70,00	R$ 16,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 70,00
Repasse: R$ 16,00"	PASSEIO
SUSPENSÃO	TROCA DA BARRA AXIAL	R$ 140,00	R$ 44,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 140,00
Repasse: R$ 44,00"	SUV
SUSPENSÃO	TROCA DA BARRA AXIAL	R$ 120,00	R$ 40,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 40,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DA BOBINA	R$ 150,00	R$ 44,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 150,00
Repasse: R$ 44,00"	SUV
PREVENTIVA DE MOTOR	TROCA DA BOBINA	R$ 120,00	R$ 40,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 40,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DA BOMBA HIDRÁULICA	R$ 285,00	R$ 90,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 285,00
Repasse: R$ 90,00"	SUV
PREVENTIVA DE MOTOR	TROCA DA BOMBA HIDRÁULICA	R$ 220,00	R$ 80,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 220,00
Repasse: R$ 80,00"	PASSEIO
SUSPENSÃO	TROCA DA COIFA DA HOMOCINÉTICA (CADA)	R$ 140,00	R$ 50,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 140,00
Repasse: R$ 50,00"	PASSEIO
SUSPENSÃO	TROCA DA COIFA DA HOMOCINÉTICA (CADA)	R$ 170,00	R$ 55,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 170,00
Repasse: R$ 55,00"	SUV
PREVENTIVA DE MOTOR	TROCA DA CORREIA DO ALTERNADOR	R$ 145,00	R$ 55,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 145,00
Repasse: R$ 55,00"	SUV
PREVENTIVA DE MOTOR	TROCA DA CORREIA DO ALTERNADOR	R$ 120,00	R$ 50,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 50,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DA VÁLVULA TERMOSTÁTICA	R$ 140,00	R$ 52,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 140,00
Repasse: R$ 52,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DA VÁLVULA TERMOSTÁTICA	R$ 170,00	R$ 58,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 170,00
Repasse: R$ 58,00"	SUV
PREVENTIVA DE MOTOR	TROCA DE ALTERNADOR	R$ 240,00	R$ 60,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 240,00
Repasse: R$ 60,00"	SUV
PREVENTIVA DE MOTOR	TROCA DE ALTERNADOR	R$ 210,00	R$ 55,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 210,00
Repasse: R$ 55,00"	PASSEIO
SUSPENSÃO	TROCA DE AMORTECEDOR TRASEIRO (PAR)	R$ 240,00	R$ 90,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 240,00
Repasse: R$ 90,00"	PASSEIO
SUSPENSÃO	TROCA DE AMORTECEDOR TRASEIRO (PAR)	R$ 315,00	R$ 100,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 315,00
Repasse: R$ 100,00"	SUV
SUSPENSÃO	TROCA DE AMORTECEDOR/MOLA/KIT COXIM (PAR DIANTEIRO)	R$ 220,00	R$ 100,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 220,00
Repasse: R$ 100,00"	PASSEIO
SUSPENSÃO	TROCA DE AMORTECEDOR/MOLA/KIT COXIM (PAR DIANTEIRO)	R$ 250,00	R$ 111,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 250,00
Repasse: R$ 111,00"	SUV
PREVENTIVA DE MOTOR	TROCA DE BATERIA	R$ 90,00	R$ 28,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 90,00
Repasse: R$ 28,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE BATERIA	R$ 120,00	R$ 31,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 31,00"	SUV
SUSPENSÃO	TROCA DE BIELETAS (PAR)	R$ 150,00	R$ 44,40	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 150,00
Repasse: R$ 44,40"	SUV
SUSPENSÃO	TROCA DE BIELETAS (PAR)	R$ 120,00	R$ 40,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 40,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE BOBINA DE IGNIÇÃO	R$ 140,00	R$ 40,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 140,00
Repasse: R$ 40,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE BOBINA DE IGNIÇÃO	R$ 165,00	R$ 44,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 165,00
Repasse: R$ 44,00"	SUV
PREVENTIVA DE MOTOR	TROCA DE CABOS DE VELA	R$ 110,00	R$ 28,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 110,00
Repasse: R$ 28,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE CABOS DE VELA	R$ 130,00	R$ 31,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 130,00
Repasse: R$ 31,00"	SUV
FREIOS	TROCA DE CILINDRO DE FREIO (UNIDADE)	R$ 120,00	R$ 45,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 45,00"	PASSEIO
FREIOS	TROCA DE CILINDRO DE FREIO (UNIDADE)	R$ 145,00	R$ 50,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 145,00
Repasse: R$ 50,00"	SUV
PREVENTIVA DE MOTOR	TROCA DE CORREIA DENTADA	R$ 390,00	R$ 150,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 390,00
Repasse: R$ 150,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE CORREIA DENTADA	R$ 460,00	R$ 166,50	90	1x	"Tempo Médio: 02:00
Serviço: R$ 460,00
Repasse: R$ 166,50"	SUV
FREIOS	TROCA DE CUBO E ROLAMENTO (POR RODA)	R$ 200,00	R$ 66,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 200,00
Repasse: R$ 66,00"	SUV
FREIOS	TROCA DE CUBO E ROLAMENTO (POR RODA)	R$ 175,00	R$ 60,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 175,00
Repasse: R$ 60,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE EMBREAGEM	R$ 720,00	R$ 300,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 720,00
Repasse: R$ 300,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE EMBREAGEM	R$ 900,00	R$ 333,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 900,00
Repasse: R$ 333,00"	SUV
PREVENTIVA DE MOTOR	TROCA DE FILTRO DE AR	R$ 50,00	R$ 10,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 50,00
Repasse: R$ 10,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE FILTRO DE AR	R$ 60,00	R$ 12,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 60,00
Repasse: R$ 12,00"	SUV
PREVENTIVA DE MOTOR	TROCA DE FILTRO DE CABINE	R$ 65,00	R$ 18,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 65,00
Repasse: R$ 18,00"	SUV
PREVENTIVA DE MOTOR	TROCA DE FILTRO DE CABINE	R$ 50,00	R$ 14,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 50,00
Repasse: R$ 14,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE FILTRO DE COMBUSTÍVEL	R$ 60,00	R$ 17,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 60,00
Repasse: R$ 17,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE FILTRO DE COMBUSTÍVEL	R$ 80,00	R$ 20,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 80,00
Repasse: R$ 20,00"	SUV
FREIOS	TROCA DE FLUIDO DE FREIO	R$ 110,00	R$ 28,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 110,00
Repasse: R$ 28,00"	PASSEIO
FREIOS	TROCA DE FLUIDO DE FREIO	R$ 140,00	R$ 31,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 140,00
Repasse: R$ 31,00"	SUV
SUSPENSÃO	TROCA DE HOMOCINÉTICA (PAR DIANTEIRO)	R$ 290,00	R$ 110,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 290,00
Repasse: R$ 110,00"	SUV
SUSPENSÃO	TROCA DE HOMOCINÉTICA (PAR DIANTEIRO)	R$ 220,00	R$ 99,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 220,00
Repasse: R$ 99,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE JUNTA DE SUPORTE DO FILTRO DE ÓLEO	R$ 120,00	R$ 36,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 36,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE JUNTA DE SUPORTE DO FILTRO DE ÓLEO	R$ 155,00	R$ 40,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 155,00
Repasse: R$ 40,00"	SUV
FREIOS	TROCA DE LONA DE FREIO (TRASEIRA)	R$ 200,00	R$ 60,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 200,00
Repasse: R$ 60,00"	PASSEIO
FREIOS	TROCA DE LONA DE FREIO (TRASEIRA)	R$ 250,00	R$ 66,60	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 250,00
Repasse: R$ 66,60"	SUV
PREVENTIVA DE MOTOR	TROCA DE MANGUEIRAS DO SISTEMA DE ARREFEICIMENTO	R$ 120,00	R$ 50,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 50,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE MANGUEIRAS DO SISTEMA DE ARREFEICIMENTO	R$ 145,00	R$ 55,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 145,00
Repasse: R$ 55,00"	SUV
SUSPENSÃO	TROCA DE MOLAS DA SUSPENSÃO (PAR)	R$ 300,00	R$ 120,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 300,00
Repasse: R$ 120,00"	SUV
SUSPENSÃO	TROCA DE MOLAS DA SUSPENSÃO (PAR)	R$ 250,00	R$ 100,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 250,00
Repasse: R$ 100,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE MOTOR DE PARTIDA	R$ 180,00	R$ 60,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 180,00
Repasse: R$ 60,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE MOTOR DE PARTIDA	R$ 220,00	R$ 66,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 220,00
Repasse: R$ 66,00"	SUV
TROCA DE ÓLEO	TROCA DE ÓLEO + FILTRO	R$ 0,00	R$ 20,00	NÃO HÁ	2x	"Tempo Médio: 02:00
Serviço: R$ 0,00
Repasse: R$ 20,00"	SUV
TROCA DE ÓLEO	TROCA DE ÓLEO + FILTRO	R$ 0,00	R$ 20,00	NÃO HÁ	2x	"Tempo Médio: 02:00
Serviço: R$ 0,00
Repasse: R$ 20,00"	PASSEIO
FREIOS	TROCA DE PASTILHA DE FREIO (PAR DIANTEIRO)	R$ 200,00	R$ 55,50	60	2x	"Tempo Médio: 02:00
Serviço: R$ 200,00
Repasse: R$ 55,50"	SUV
FREIOS	TROCA DE PASTILHA DE FREIO (PAR DIANTEIRO)	R$ 150,00	R$ 50,00	60	2x	"Tempo Médio: 02:00
Serviço: R$ 150,00
Repasse: R$ 50,00"	PASSEIO
SUSPENSÃO	TROCA DE PIVÔ DE SUSPENSÃO (UNIDADE)	R$ 100,00	R$ 30,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 100,00
Repasse: R$ 30,00"	PASSEIO
SUSPENSÃO	TROCA DE PIVÔ DE SUSPENSÃO (UNIDADE)	R$ 130,00	R$ 33,30	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 130,00
Repasse: R$ 33,30"	SUV
FREIOS	TROCA DE SAPATA DE FREIO	R$ 200,00	R$ 65,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 200,00
Repasse: R$ 65,00"	PASSEIO
FREIOS	TROCA DE SAPATA DE FREIO	R$ 230,00	R$ 72,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 230,00
Repasse: R$ 72,00"	SUV
FREIOS	TROCA DE SENSOR DE ABS (UNID.)	R$ 200,00	R$ 49,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 200,00
Repasse: R$ 49,00"	SUV
FREIOS	TROCA DE SENSOR DE ABS (UNID.)	R$ 180,00	R$ 44,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 180,00
Repasse: R$ 44,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE SONDA LAMBDA	R$ 180,00	R$ 44,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 180,00
Repasse: R$ 44,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DE SONDA LAMBDA	R$ 200,00	R$ 50,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 200,00
Repasse: R$ 50,00"	SUV
PREVENTIVA DE MOTOR	TROCA DE VELAS	R$ 190,00	R$ 42,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 190,00
Repasse: R$ 42,00"	SUV
PREVENTIVA DE MOTOR	TROCA DE VELAS	R$ 140,00	R$ 38,00	90	1x	"Tempo Médio: 00:30
Serviço: R$ 140,00
Repasse: R$ 38,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DO COXIM DO MOTOR	R$ 120,00	R$ 30,00	90	2x	"Tempo Médio: 01:00
Serviço: R$ 120,00
Repasse: R$ 30,00"	PASSEIO
SUSPENSÃO	TROCA DO COXIM DO AMORTECEDOR	R$ 250,00	R$ 120,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 250,00
Repasse: R$ 120,00"	SUV
SUSPENSÃO	TROCA DO COXIM DO AMORTECEDOR	R$ 200,00	R$ 100,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 200,00
Repasse: R$ 100,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DO COXIM DO CÂMBIO	R$ 100,00	R$ 50,00	90	2x	"Tempo Médio: 01:30
Serviço: R$ 100,00
Repasse: R$ 50,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DO COXIM DO CÂMBIO	R$ 150,00	R$ 60,00	90	2x	"Tempo Médio: 01:30
Serviço: R$ 150,00
Repasse: R$ 60,00"	SUV
PREVENTIVA DE MOTOR	TROCA DO COXIM DO MOTOR	R$ 150,00	R$ 50,00	90	2x	"Tempo Médio: 01:00
Serviço: R$ 150,00
Repasse: R$ 50,00"	SUV
PREVENTIVA DE MOTOR	TROCA DO INTERRUPTOR DE ÓLEO	R$ 80,00	R$ 23,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 80,00
Repasse: R$ 23,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DO INTERRUPTOR DE ÓLEO	R$ 90,00	R$ 25,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 90,00
Repasse: R$ 25,00"	SUV
PREVENTIVA DE MOTOR	TROCA DO RESERVATÓRIO DE ÁGUA	R$ 120,00	R$ 35,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 35,00"	SUV
PREVENTIVA DE MOTOR	TROCA DO RESERVATÓRIO DE ÁGUA	R$ 90,00	R$ 30,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 90,00
Repasse: R$ 30,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DO ROLAMENTO POLIA AUXILIAR	R$ 140,00	R$ 52,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 140,00
Repasse: R$ 52,00"	SUV
FREIOS	TROCA DO TAMBOR DE FREIO (UNIDADE)	R$ 140,00	R$ 38,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 140,00
Repasse: R$ 38,00"	PASSEIO
FREIOS	TROCA DO TAMBOR DE FREIO (UNIDADE)	R$ 165,00	R$ 43,00	90	2x	"Tempo Médio: 02:00
Serviço: R$ 165,00
Repasse: R$ 43,00"	SUV
PREVENTIVA DE MOTOR	TROCA DO TENSOR DA CORREIA AUXILIAR	R$ 220,00	R$ 50,00	180	2x	"Tempo Médio: 02:00
Serviço: R$ 220,00
Repasse: R$ 50,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DOS COMPONENTES DA BOMBA DE COMBUSTÍVEL	R$ 190,00	R$ 60,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 190,00
Repasse: R$ 60,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA DOS COMPONENTES DA BOMBA DE COMBUSTÍVEL	R$ 230,00	R$ 66,00	90	1x	"Tempo Médio: 02:00
Serviço: R$ 230,00
Repasse: R$ 66,00"	SUV
PREVENTIVA DE MOTOR	TROCA ÓLEO DE TRANSMISSÃO MANUAL	R$ 100,00	R$ 35,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 100,00
Repasse: R$ 35,00"	PASSEIO
PREVENTIVA DE MOTOR	TROCA ÓLEO DE TRANSMISSÃO MANUAL	R$ 120,00	R$ 35,00	90	Não Há	"Tempo Médio: 02:00
Serviço: R$ 120,00
Repasse: R$ 40,00"	SUV`;

  const rows = useMemo(() => parseTSV(tsv), [tsv]);
  const headers = rows[0] || [];
  const data = useMemo(() => {
    const body = rows.slice(1);
    return body.map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = r[idx] ?? '';
      });
      return obj;
    });
  }, [rows, headers]);
  const desiredOrder = ['Descrição','Tipo Veículo','Valor Serviço','Valor Repasse','Garantia Dias','Limite Anual','Informações'];
  const columns = desiredOrder.filter((c) => headers.includes(c));
  const tipos = useMemo(() => {
    const set = new Set();
    data.forEach((d) => { if (d['Tipo']) set.add(d['Tipo']); });
    return Array.from(set);
  }, [data]);
  const [activeTipo, setActiveTipo] = useState('');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (activeTipo && d['Tipo'] !== activeTipo) return false;
      if (query && !(d['Descrição'] || '').toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [data, activeTipo, query]);

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
            <div className="precos-toolbar">
              <div className="tipo-tabs">
                <button className={`tipo-tab ${activeTipo === '' ? 'active' : ''}`} onClick={() => setActiveTipo('')}>Todos</button>
                {tipos.map((t) => (
                  <button key={t} className={`tipo-tab ${activeTipo === t ? 'active' : ''}`} onClick={() => setActiveTipo(t)}>{t}</button>
                ))}
              </div>
              <input className="precos-search" placeholder="Buscar serviço" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="table-responsive">
            <table className="precos-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((c) => (
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
