export function pagoPropietario({
  nombrePropietario,
  titulo,
  alias,
  importe,
  fechas,
  fechaPago,
  reserva,
}: {
  nombrePropietario: string;
  titulo: string;
  alias: string;
  importe: string;
  fechas: string[];
  fechaPago: string;
  reserva: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
      
      <div style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border-radius:12px;
        padding:30px;
        border:1px solid #e5e5e5;
      ">

        <h1 style="
          margin-top:0;
          color:#111111;
          font-size:24px;
        ">
          Pago acreditado
        </h1>

        <p style="
          color:#444444;
          font-size:16px;
          line-height:1.6;
        ">
          Hola ${nombrePropietario},
        </p>

        <p style="
          color:#444444;
          font-size:16px;
          line-height:1.6;
        ">
          Te informamos que Localiar realizó el pago correspondiente
          a tu reserva.
        </p>

        <div style="
          background:#f8f8f8;
          border-radius:10px;
          padding:20px;
          margin:25px 0;
        ">

          <p style="margin:0 0 10px 0;">
            <strong>Publicación:</strong> ${titulo}
          </p>

          <p style="margin:0 0 10px 0;">
            <strong>Reserva:</strong> ${reserva}
          </p>

          <p style="margin:0 0 10px 0;">
            <strong>Fechas contratadas:</strong>
          </p>

          <ul style="
            margin-top:5px;
            padding-left:20px;
          ">
            ${fechas
              .map(
                (fecha) =>
                  `<li style="margin-bottom:5px;">${fecha}</li>`
              )
              .join("")}
          </ul>

          <p style="margin:15px 0 10px 0;">
            <strong>Alias de destino:</strong> ${alias}
          </p>

          <p style="
            margin:15px 0 0 0;
            font-size:22px;
            color:#16A34A;
          ">
            <strong>Importe acreditado: ${importe}</strong>
          </p>

          <p style="
            margin:10px 0 0 0;
            color:#666666;
          ">
            <strong>Fecha de pago:</strong> ${fechaPago}
          </p>

        </div>

        <p style="
          color:#444444;
          font-size:15px;
          line-height:1.6;
        ">
          El importe informado corresponde al pago efectuado por
          Localiar por esta reserva.
        </p>

        <p style="
          color:#666666;
          font-size:14px;
          line-height:1.5;
          margin-top:30px;
        ">
          Este correo es una constancia de que el pago fue registrado
          como realizado en Localiar.
        </p>

        <p style="
          color:#999999;
          font-size:13px;
          margin-top:30px;
        ">
          Localiar
        </p>

      </div>

    </div>
  `;
}