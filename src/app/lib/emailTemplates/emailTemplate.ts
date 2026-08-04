export function emailTemplate({
  titulo,
  contenido,
}: {
  titulo: string;
  contenido: string;
}) {
  return `
<!DOCTYPE html>
<html lang="es">

<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body
style="
margin:0;
padding:0;
background:#f4f4f4;
font-family:Arial, Helvetica, sans-serif;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="padding:40px 0;background:#f4f4f4;">

<tr>

<td align="center">

<table
width="700"
cellpadding="0"
cellspacing="0"
style="
background:white;
border-radius:14px;
overflow:hidden;
border:1px solid #e7e7e7;
">

<tr>

<td
style="
background:#050505;
padding:35px;
text-align:center;
">

<img
src="{{LOGO_LOCALIAR}}"
alt="Localiar"
style="
max-width:220px;
height:auto;
display:block;
margin:auto;
"
/>

</td>

</tr>

<tr>

<td
style="
height:8px;
background:#FF7A00;
">
</td>

</tr>

<tr>

<td
style="
padding:45px;
">

<h2
style="
margin-top:0;
margin-bottom:30px;
font-size:30px;
color:#111;
">

${titulo}

</h2>

${contenido}

</td>

</tr>

<tr>

<td
style="
background:#fafafa;
padding:35px 45px;
font-size:11px;
line-height:19px;
color:#666;
border-top:1px solid #ececec;
">

<strong>Información legal</strong>

<br><br>

La presente comunicación constituye una constancia electrónica emitida automáticamente por Localiar respecto de una operación realizada dentro de la plataforma.

Los usuarios manifiestan haber proporcionado información veraz, ser mayores de edad, contar con capacidad legal suficiente para contratar y aceptar íntegramente los Términos y Condiciones de uso vigentes al momento de efectuar la operación.

Localiar actúa exclusivamente como plataforma tecnológica de intermediación entre usuarios. No reviste el carácter de propietario, locador, locatario, inmobiliaria, aseguradora, garante ni representante legal de ninguna de las partes.

Las obligaciones derivadas del contrato celebrado corresponden exclusivamente al propietario y al inquilino.

Cada usuario es responsable por la autenticidad de su identidad, la exactitud de la información suministrada, el cumplimiento de la normativa vigente y la legalidad de las actividades desarrolladas durante la relación contractual.

La utilización de documentación falsa, identidades ficticias, datos inexactos o cualquier conducta contraria a la legislación aplicable podrá dar lugar a la suspensión de la cuenta, cancelación de operaciones y eventual comunicación a las autoridades competentes.

Toda controversia derivada del contrato celebrado deberá resolverse entre las partes conforme a la legislación vigente y a los mecanismos previstos en los Términos y Condiciones de Localiar.

Este correo fue generado automáticamente. Por favor, no responder este mensaje.

<br><br>

<div
style="
text-align:center;
color:#999;
font-size:12px;
">

© Localiar · Todos los derechos reservados

</div>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
}