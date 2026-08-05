import { emailTemplate } from "./emailTemplate";

export function cancelacionInquilino({
  nombreInquilino,
  nombrePropietario,
  titulo,
  urlPublicacion,
  fechas,
  totalAlquiler,
  comision,
  resguardo,
  canceladoPor,
}: {
  nombreInquilino: string;
  nombrePropietario: string;
  titulo: string;
  urlPublicacion: string;
  fechas: string[];
  totalAlquiler: number;
  comision: number;
  resguardo: number;
  canceladoPor: string;
}) {

  const informacionImportante =
    canceladoPor === "propietario"
      ? `
        <p style="margin-top:10px;">
          La cancelación fue realizada por el propietario.
          Conforme a las condiciones de Localiar, la comisión
          correspondiente será reintegrada al inquilino.
        </p>

        <p>
          El resguardo será gestionado conforme a las condiciones
          establecidas entre las partes y a la situación de la reserva.
        </p>
      `
      : `
        <p style="margin-top:10px;">
          La comisión correspondiente a Localiar no será reintegrada
          conforme a las condiciones aceptadas al momento de realizar
          la reserva.
        </p>

        <p>
          El resguardo será gestionado conforme a las condiciones
          establecidas entre las partes y a la situación de la reserva.
        </p>
      `;


  const contenido = `

    <p>
      Hola <strong>${nombreInquilino}</strong>.
    </p>

    <p>
      Tu reserva fue cancelada correctamente.
    </p>

    <hr style="
      border:none;
      border-top:1px solid #eee;
      margin:30px 0;
    ">

    <table
      cellpadding="8"
      cellspacing="0"
      style="
        width:100%;
        font-size:15px;
      "
    >

      <tr>
        <td>
          <strong>Propietario</strong>
        </td>

        <td>
          ${nombrePropietario}
        </td>
      </tr>


      <tr>
        <td>
          <strong>Publicación</strong>
        </td>

        <td>
          <a
            href="${urlPublicacion}"
            style="
              color:#FF7A00;
              text-decoration:none;
              font-weight:bold;
            "
          >
            ${titulo}
          </a>
        </td>
      </tr>


      <tr>
        <td>
          <strong>Fechas canceladas</strong>
        </td>

        <td>
          ${fechas.join("<br>")}
        </td>
      </tr>


      <tr>
        <td>
          <strong>Cantidad de jornadas</strong>
        </td>

        <td>
          ${fechas.length}
        </td>
      </tr>


      <tr>
        <td>
          <strong>Total alquiler</strong>
        </td>

        <td>
          $${totalAlquiler.toLocaleString("es-AR")}
        </td>
      </tr>


      <tr>
        <td>
          <strong>Comisión Localiar</strong>
        </td>

        <td>
          $${comision.toLocaleString("es-AR")}
        </td>
      </tr>


      <tr>
        <td>
          <strong>Resguardo</strong>
        </td>

        <td>
          $${resguardo.toLocaleString("es-AR")}
        </td>
      </tr>


    </table>


    <div
      style="
        margin-top:30px;
        padding:18px;
        background:#FFF7EF;
        border-left:5px solid #FF7A00;
        border-radius:8px;
      "
    >

      <strong>Información importante</strong>

      ${informacionImportante}

    </div>

  `;


  return emailTemplate({
    titulo: "Reserva cancelada",
    contenido,
  });

}