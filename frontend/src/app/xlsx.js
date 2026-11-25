// Gera um arquivo .xlsx de verdade (Excel, Google Planilhas, LibreOffice), sem biblioteca:
// o .xlsx é um .zip com arquivos XML. Aqui o zip é montado sem compressão, o que o Excel aceita.
//
// Uma aba é descrita assim:
// { nome, larguras: [12, 30], linhas: [[{ v: 'Texto', s: 'cabecalho' }, { f: 'SUM(B2:B9)', s: 'moeda' }]],
//   juntar: ['A1:D1'], congelar: 'A4', filtro: 'A3:D3',
//   listas: [{ faixa: 'C4:C300', opcoes: ['Entrou', 'Saiu'] }],
//   cores: [{ faixa: 'E4:E300', igual: 'Entregue', estilo: 'verde' }] }
// Célula pode ser texto, número, Date, null ou { v, f, s }.

// ---------- Estilos ----------
// Cada nome vira um índice em cellXfs. Fontes, preenchimentos e bordas ficam nas listas abaixo.
const COR = { indigo: 'FF1F3A73', bege: 'FFEDF0F7', amarelo: 'FFFFF1C9', verde: 'FF2F6B4F', verdeClaro: 'FFE3F0E8', vermelho: 'FFB3261E', apoio: 'FF5B6278', linha: 'FFD5DBE7', branco: 'FFFFFFFF' };

const FONTES = [
  '<font><sz val="11"/><name val="Calibri"/></font>',
  `<font><b/><sz val="16"/><color rgb="${COR.indigo}"/><name val="Calibri"/></font>`,
  `<font><i/><sz val="10"/><color rgb="${COR.apoio}"/><name val="Calibri"/></font>`,
  `<font><b/><sz val="11"/><color rgb="${COR.branco}"/><name val="Calibri"/></font>`,
  '<font><b/><sz val="11"/><name val="Calibri"/></font>',
  `<font><b/><sz val="14"/><color rgb="${COR.verde}"/><name val="Calibri"/></font>`,
  `<font><sz val="11"/><color rgb="${COR.verde}"/><name val="Calibri"/></font>`,
  `<font><sz val="11"/><color rgb="${COR.vermelho}"/><name val="Calibri"/></font>`,
  `<font><b/><sz val="12"/><color rgb="${COR.indigo}"/><name val="Calibri"/></font>`,
];
const preenche = (cor) => `<fill><patternFill patternType="solid"><fgColor rgb="${cor}"/><bgColor indexed="64"/></patternFill></fill>`;
const FUNDOS = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>', preenche(COR.indigo), preenche(COR.bege), preenche(COR.amarelo), preenche(COR.verdeClaro)];
const lado = (nome, estilo = 'thin', cor = COR.linha) => `<${nome} style="${estilo}"><color rgb="${cor}"/></${nome}>`;
const BORDAS = [
  '<border><left/><right/><top/><bottom/><diagonal/></border>',
  `<border>${lado('left')}${lado('right')}${lado('top')}${lado('bottom')}<diagonal/></border>`,
  `<border><left/><right/>${lado('top', 'medium', COR.indigo)}${lado('bottom', 'medium', COR.indigo)}<diagonal/></border>`,
];
const FORMATOS = { data: 164, moeda: 165, mes: 166 };
const NUM_FMTS = `<numFmts count="3"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/><numFmt numFmtId="165" formatCode="&quot;R$&quot;\\ #,##0.00;[Red]\\-&quot;R$&quot;\\ #,##0.00"/><numFmt numFmtId="166" formatCode="mmm/yyyy"/></numFmts>`;

// [nome, formato, fonte, fundo, borda, alinhamento]
const ESTILOS = [
  ['normal', 0, 0, 0, 0],
  ['titulo', 0, 1, 0, 0],
  ['nota', 0, 2, 0, 0, '<alignment wrapText="1" vertical="top"/>'],
  ['cabecalho', 0, 3, 2, 1, '<alignment horizontal="center" vertical="center" wrapText="1"/>'],
  ['texto', 0, 0, 0, 1, '<alignment vertical="center"/>'],
  ['data', FORMATOS.data, 0, 0, 1, '<alignment horizontal="center"/>'],
  ['moeda', FORMATOS.moeda, 0, 0, 1],
  ['inteiro', 3, 0, 0, 1, '<alignment horizontal="center"/>'],
  ['totalRotulo', 0, 4, 3, 2],
  ['totalMoeda', FORMATOS.moeda, 4, 3, 2],
  ['totalInteiro', 3, 4, 3, 2, '<alignment horizontal="center"/>'],
  ['entradaMoeda', FORMATOS.moeda, 0, 4, 1],
  ['entradaInteiro', 3, 0, 4, 1, '<alignment horizontal="center"/>'],
  ['entradaPorcento', 9, 0, 4, 1, '<alignment horizontal="center"/>'],
  ['destaqueMoeda', FORMATOS.moeda, 5, 5, 1],
  ['mes', FORMATOS.mes, 0, 0, 1, '<alignment horizontal="center"/>'],
  ['porcento', 9, 0, 0, 1, '<alignment horizontal="center"/>'],
  ['moedaEntrou', FORMATOS.moeda, 6, 0, 1],
  ['moedaSaiu', FORMATOS.moeda, 7, 0, 1],
  ['subtitulo', 0, 8, 0, 0],
  ['textoForte', 0, 4, 0, 1, '<alignment vertical="center"/>'],
  ['entradaTexto', 0, 0, 4, 1],
];
const INDICE = Object.fromEntries(ESTILOS.map(([nome], i) => [nome, i]));

// Cores das regras condicionais (situação dos pedidos).
const DXFS = { verde: 0, azul: 1, amarelo: 2 };
const dxf = (fundo, letra) => `<dxf><font><color rgb="${letra}"/></font><fill><patternFill><bgColor rgb="${fundo}"/></patternFill></fill></dxf>`;

function estilosXml() {
  const xfs = ESTILOS.map(([, fmt, fonte, fundo, borda, alinhamento = '']) => (
    `<xf numFmtId="${fmt}" fontId="${fonte}" fillId="${fundo}" borderId="${borda}" xfId="0"${fmt ? ' applyNumberFormat="1"' : ''} applyFont="1" applyFill="1" applyBorder="1"${alinhamento ? ' applyAlignment="1">' + alinhamento + '</xf>' : '/>'}`
  ));
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${NUM_FMTS}
<fonts count="${FONTES.length}">${FONTES.join('')}</fonts>
<fills count="${FUNDOS.length}">${FUNDOS.join('')}</fills>
<borders count="${BORDAS.length}">${BORDAS.join('')}</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
<dxfs count="3">${dxf(COR.verdeClaro, COR.verde)}${dxf('FFE4E9F3', COR.indigo)}${dxf(COR.amarelo, 'FF7A5600')}</dxfs>
</styleSheet>`;
}

// ---------- Células ----------
export const coluna = (i) => {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

const xml = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
  // eslint-disable-next-line no-control-regex
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

// Data do Excel: dias desde 30/12/1899.
export function dataExcel(d) {
  return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1899, 11, 30)) / 86400000);
}

function celulaXml(c, ref) {
  if (c === null || c === undefined) return '';
  const cel = typeof c === 'object' && !(c instanceof Date) ? c : { v: c };
  const s = cel.s ? ` s="${INDICE[cel.s] ?? 0}"` : '';
  if (cel.f) return `<c r="${ref}"${s}><f>${xml(cel.f)}</f></c>`;
  const v = cel.v instanceof Date ? dataExcel(cel.v) : cel.v;
  if (v === null || v === undefined || v === '') return s ? `<c r="${ref}"${s}/>` : '';
  if (typeof v === 'number') return Number.isFinite(v) ? `<c r="${ref}"${s}><v>${v}</v></c>` : '';
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;
}

function abaXml(aba, ativa) {
  const linhas = aba.linhas.map((linha, i) => {
    const altura = aba.alturas?.[i] ? ` ht="${aba.alturas[i]}" customHeight="1"` : '';
    return `<row r="${i + 1}"${altura}>${(linha || []).map((c, j) => celulaXml(c, `${coluna(j)}${i + 1}`)).join('')}</row>`;
  }).join('');
  const congelar = aba.congelar
    ? `<pane ySplit="${Number(aba.congelar.replace(/\D/g, '')) - 1}" topLeftCell="${aba.congelar}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="${aba.congelar}" sqref="${aba.congelar}"/>`
    : '';
  const larguras = aba.larguras?.length
    ? `<cols>${aba.larguras.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : '';
  const juntar = aba.juntar?.length ? `<mergeCells count="${aba.juntar.length}">${aba.juntar.map((r) => `<mergeCell ref="${r}"/>`).join('')}</mergeCells>` : '';
  let prioridade = 0;
  const cores = (aba.cores || []).map((r) => `<conditionalFormatting sqref="${r.faixa}"><cfRule type="cellIs" dxfId="${DXFS[r.estilo]}" priority="${prioridade += 1}" operator="equal"><formula>"${xml(r.igual)}"</formula></cfRule></conditionalFormatting>`).join('');
  const listas = aba.listas?.length
    ? `<dataValidations count="${aba.listas.length}">${aba.listas.map((l) => `<dataValidation type="list" allowBlank="1" showErrorMessage="1" errorTitle="Valor fora da lista" error="Escolha um item da lista." sqref="${l.faixa}"><formula1>"${xml(l.opcoes.join(','))}"</formula1></dataValidation>`).join('')}</dataValidations>` : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><tabColor rgb="${aba.cor || COR.indigo}"/><pageSetUpPr fitToPage="1"/></sheetPr>
<sheetViews><sheetView showGridLines="0"${ativa ? ' tabSelected="1"' : ''} workbookViewId="0">${congelar}</sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="18"/>${larguras}
<sheetData>${linhas}</sheetData>${aba.filtro ? `<autoFilter ref="${aba.filtro}"/>` : ''}${juntar}${cores}${listas}
<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>
<pageSetup paperSize="9" orientation="${aba.paisagem ? 'landscape' : 'portrait'}" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
}

function livroXml(abas, ativa) {
  const nomes = abas.map((a, i) => (a.filtro ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${xml(a.nome)}'!$${a.filtro.replace(/([A-Z]+)(\d+)/g, '$1$$$2').replace(':', ':$')}</definedName>` : '')).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<bookViews><workbookView activeTab="${ativa}"/></bookViews>
<sheets>${abas.map((a, i) => `<sheet name="${xml(a.nome)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>
${nomes ? `<definedNames>${nomes}</definedNames>` : ''}
<calcPr calcId="191029" fullCalcOnLoad="1"/>
</workbook>`;
}

function arquivos(abas, { ativa = 0, titulo = '' } = {}) {
  const n = abas.length;
  return {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${abas.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>',
    'docProps/core.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xml(titulo)}</dc:title><dc:creator>Arremate</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created></cp:coreProperties>`,
    'xl/workbook.xml': livroXml(abas, ativa),
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${abas.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml': estilosXml(),
    ...Object.fromEntries(abas.map((a, i) => [`xl/worksheets/sheet${i + 1}.xml`, abaXml(a, i === ativa)])),
  };
}

// ---------- Zip sem compressão ----------
const TABELA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (const b of bytes) c = TABELA_CRC[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

export function zip(entradas) {
  const cod = new TextEncoder();
  const partes = [];
  const central = [];
  let posicao = 0;
  for (const [nome, conteudo] of Object.entries(entradas)) {
    const nomeB = cod.encode(nome);
    const dados = typeof conteudo === 'string' ? cod.encode(conteudo) : conteudo;
    const crc = crc32(dados);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034B50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // nomes em UTF-8
    local.setUint32(14, crc, true);
    local.setUint32(18, dados.length, true);
    local.setUint32(22, dados.length, true);
    local.setUint16(26, nomeB.length, true);
    partes.push(new Uint8Array(local.buffer), nomeB, dados);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014B50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, dados.length, true);
    c.setUint32(24, dados.length, true);
    c.setUint16(28, nomeB.length, true);
    c.setUint32(42, posicao, true);
    central.push(new Uint8Array(c.buffer), nomeB);
    posicao += 30 + nomeB.length + dados.length;
  }
  const tamanhoCentral = central.reduce((s, p) => s + p.length, 0);
  const fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054B50, true);
  fim.setUint16(8, central.length / 2, true);
  fim.setUint16(10, central.length / 2, true);
  fim.setUint32(12, tamanhoCentral, true);
  fim.setUint32(16, posicao, true);
  const todas = [...partes, ...central, new Uint8Array(fim.buffer)];
  const saida = new Uint8Array(todas.reduce((s, p) => s + p.length, 0));
  let i = 0;
  for (const p of todas) { saida.set(p, i); i += p.length; }
  return saida;
}

export function gerarXlsx(abas, opcoes) {
  return zip(arquivos(abas, opcoes));
}
