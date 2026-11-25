package br.com.arremate.service.ia;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Troca por "••••" números longos (CPF, cartão, conta, telefone, códigos) e valores de senha
// antes de o texto sair para a IA. O front já faz o mesmo (frontend/src/ia/dadosSensiveis.js);
// aqui é uma segunda proteção, para nenhum outro cliente mandar esses dados ao Google.
// Valores em dinheiro ("R$ 1.500,00", "200 reais") ficam, porque ajudam a entender o problema.
public final class MascaraDadosSensiveis {

    public static final String MASCARA = "••••";

    private static final Pattern DINHEIRO = Pattern.compile(
            "R\\$\\s?\\d[\\d.,]*|\\b\\d[\\d.,]*\\s?(?:reais|real|mil)\\b",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
    private static final Pattern NUMEROS_LONGOS = Pattern.compile("\\d(?:[\\s./-]?\\d){3,}");
    private static final String PALAVRA = "(senha|c[oó]digo|token|pin)";
    private static final String VALOR = "([^\\s,.;!?]+)";
    // "senha: banana", "código é xyz"
    private static final Pattern VALOR_DIRETO = Pattern.compile(
            "\\b" + PALAVRA + "(\\s*(?:é|:)\\s*)" + VALOR,
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
    // "senha abc123"
    private static final Pattern VALOR_COM_NUMERO = Pattern.compile(
            "\\b" + PALAVRA + "(\\s+)([^\\s,.;!?]*\\d[^\\s,.;!?]*)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
    // "minha senha do banco é banana"
    private static final Pattern SENHA_DEPOIS = Pattern.compile(
            "\\b(senha|pin)\\b((?:\\s+\\S+){0,3}?\\s+(?:é|:)\\s*)" + VALOR,
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

    private MascaraDadosSensiveis() {
    }

    public static String mascarar(String texto) {
        if (texto == null) {
            return "";
        }
        // 1. Guarda os valores em dinheiro em marcadores sem dígitos
        List<String> guardados = new ArrayList<>();
        Matcher m = DINHEIRO.matcher(texto);
        StringBuilder sb = new StringBuilder();
        while (m.find() && guardados.size() < 26) {
            m.appendReplacement(sb, Matcher.quoteReplacement(marcador(guardados.size())));
            guardados.add(m.group());
        }
        m.appendTail(sb);
        String saida = sb.toString();

        // 2. Mascara números longos e valores de senha ou código
        saida = NUMEROS_LONGOS.matcher(saida).replaceAll(MASCARA);
        saida = trocarValor(VALOR_DIRETO, saida);
        saida = trocarValor(VALOR_COM_NUMERO, saida);
        saida = trocarValor(SENHA_DEPOIS, saida);

        // 3. Devolve os valores em dinheiro
        for (int i = 0; i < guardados.size(); i++) {
            saida = saida.replace(marcador(i), guardados.get(i));
        }
        return saida;
    }

    private static String trocarValor(Pattern padrao, String texto) {
        return padrao.matcher(texto).replaceAll(r -> Matcher.quoteReplacement(r.group(1) + r.group(2) + MASCARA));
    }

    private static String marcador(int i) {
        return "\u0000" + (char) ('A' + i) + "\u0000";
    }
}
