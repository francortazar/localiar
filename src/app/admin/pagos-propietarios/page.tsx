"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { enviarEmailPagoPropietario } from "../../lib/enviarEmailPagoPropietario";

export default function PagosPropietariosPage() {
 const [pagos, setPagos] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

const [pagosHistorial, setPagosHistorial] = useState<any[]>([]);
const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [desdePendientes, setDesdePendientes] = useState("");
const [hastaPendientes, setHastaPendientes] = useState("");

const [desdeHistorial, setDesdeHistorial] = useState("");
const [hastaHistorial, setHastaHistorial] = useState("");
const [pagoSeleccionado, setPagoSeleccionado] = useState<any | null>(null);
const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    obtenerPagos();
  }, []);

  async function obtenerPagos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("reservation_payments")
      .select(`
        id,
        reservation_id,
        publication_id,
        owner_id,
        amount,
        status,
        owner_payment_status,
        created_at,

        owner:profiles!owner_id(
          id,
          nombre,
          telefono,
          email
        ),

        publications(
          titulo,
          alias_pago,
          resguardo
        ),

        reservations(
          fecha,
          operacion_id
        )
      `)
      .eq("status", "Aprobado")
      .eq("owner_payment_status", "pendiente")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("ERROR PAGOS PROPIETARIOS:", error);
      setLoading(false);
      return;
    }

    /*
     * Obtenemos las operaciones correspondientes
     * a los pagos pendientes.
     */
    const operaciones = [
      ...new Set(
        data
          ?.map((pago: any) => {
            const reserva = Array.isArray(pago.reservations)
              ? pago.reservations[0]
              : pago.reservations;

            return reserva?.operacion_id;
          })
          .filter(Boolean)
      ),
    ];

    /*
     * Buscamos todas las fechas de esas operaciones,
     * pero solamente las que siguen aceptadas
     * por el propietario.
     */
    let todasLasFechas: any[] = [];

    if (operaciones.length > 0) {
      const { data: fechasData, error: fechasError } = await supabase
        .from("reservations")
        .select(`
          operacion_id,
          fecha,
          estado_propietario
        `)
        .eq("estado_propietario", "aceptada")
        .in("operacion_id", operaciones);

      if (fechasError) {
        console.error(
          "ERROR OBTENIENDO FECHAS:",
          fechasError
        );
      }

      todasLasFechas = fechasData || [];
    }

    const pagosFormateados =
      data?.map((pago: any) => {
        const reserva = Array.isArray(pago.reservations)
          ? pago.reservations[0]
          : pago.reservations;

        /*
         * Todas las fechas aceptadas de esta operación.
         */
        const fechas =
          todasLasFechas
            .filter(
              (r: any) =>
                r.operacion_id === reserva?.operacion_id
            )
            .map((r: any) => r.fecha)
            .sort() || [];

        /*
         * Última fecha contratada.
         */
        const fechaFinal =
          fechas.length > 0
            ? fechas[fechas.length - 1]
            : null;

        /*
         * Fecha en la que corresponde pagar:
         * último día contratado + 1 día.
         */
        let fechaPago = "-";
        let fechaPagoOrden = "9999-12-31";

        if (fechaFinal) {
          const [año, mes, dia] = fechaFinal
            .split("-")
            .map(Number);

          const fecha = new Date(
            año,
            mes - 1,
            dia
          );

          fecha.setDate(fecha.getDate() + 1);

          const añoPago = fecha.getFullYear();
          const mesPago = String(
            fecha.getMonth() + 1
          ).padStart(2, "0");
          const diaPago = String(
            fecha.getDate()
          ).padStart(2, "0");

          /*
           * Esta fecha se usa SOLO para ordenar.
           */
          fechaPagoOrden =
            `${añoPago}-${mesPago}-${diaPago}`;

          /*
           * Esta es la fecha que mostramos.
           */
          fechaPago =
            fecha.toLocaleDateString("es-AR");
        }

        /*
         * Cálculo del importe al propietario.
         *
         * El resguardo NO se paga al propietario.
         */

        const totalCobrado =
          Number(pago.amount || 0);

        const resguardo =
          Number(
            pago.publications?.resguardo || 0
          );

        const alquilerConComision =
          totalCobrado - resguardo;

        const alquilerBase =
          alquilerConComision / 1.075;

        const cobraPropietario =
          alquilerBase * 0.925;

        /*
         * Formateamos las fechas contratadas
         * para mostrarlas una debajo de otra.
         */
        const fechasFormateadas =
          fechas.map((fecha: string) =>
            new Date(
              `${fecha}T00:00:00`
            ).toLocaleDateString("es-AR")
          );

        return {
          id: pago.id,

          fecha: fechaPago,

          fechaPagoOrden,

          propietario:
            pago.owner?.nombre || "-",

          telefono:
            pago.owner?.telefono || "-",

          mail:
            pago.owner?.email || "-",

          alias:
            pago.publications?.alias_pago || "-",

          fechaContratada:
            fechasFormateadas,

          publicacion:
            pago.publications?.titulo || "-",

          reserva:
            `#${String(
              pago.reservation_id
            ).slice(0, 8)}`,

          importe:
            new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
              maximumFractionDigits: 0,
            }).format(
              cobraPropietario
            ),

          estado: "Pendiente",
        };
      }) || [];

    /*
     * ORDEN FINAL:
     * fecha de pago más próxima arriba.
     */
    pagosFormateados.sort(
      (a: any, b: any) =>
        a.fechaPagoOrden.localeCompare(
          b.fechaPagoOrden
        )
    );

    setPagos(pagosFormateados);
setLoading(false);

obtenerHistorialPagos();
}

async function obtenerHistorialPagos() {
  setLoadingHistorial(true);

  const { data, error } = await supabase
    .from("reservation_payments")
    .select(`
      id,
      reservation_id,
      publication_id,
      owner_id,
      amount,
      status,
      owner_payment_status,
      owner_paid_at,
      created_at,

      owner:profiles!owner_id(
        id,
        nombre,
        telefono,
        email
      ),

      publications(
        titulo,
        alias_pago,
        resguardo
      ),

      reservations(
        fecha,
        operacion_id
      )
    `)
    .eq("status", "Aprobado")
    .eq("owner_payment_status", "pagado")
    .order("owner_paid_at", { ascending: false });

  if (error) {
    console.error(
      "ERROR HISTORIAL PAGOS PROPIETARIOS:",
      error
    );

    setLoadingHistorial(false);
    return;
  }

  const historialFormateado = (data || []).map((pago: any) => {
  const resguardo = Number(
    pago.publications?.resguardo || 0
  );

  const totalCobrado = Number(
    pago.amount || 0
  );

  const alquilerConComision =
    totalCobrado - resguardo;

  const alquilerBase =
    alquilerConComision / 1.075;

  const cobraPropietario =
    alquilerBase * 0.925;

  return {
    ...pago,
    importePropietario: cobraPropietario,
  };
});

setPagosHistorial(historialFormateado);
setLoadingHistorial(false);
}

const pagosHistorialFiltrados = pagosHistorial.filter(
  (pago: any) => {
    if (!pago.owner_paid_at) return false;

    const fecha = pago.owner_paid_at.split("T")[0];

    if (
      desdeHistorial &&
      fecha < desdeHistorial
    ) {
      return false;
    }

    if (
      hastaHistorial &&
      fecha > hastaHistorial
    ) {
      return false;
    }

    return true;
  }
);

  const pagosPendientesFiltrados = pagos.filter((pago) => {
  const fecha = pago.fechaPagoOrden;

  if (desdePendientes && fecha < desdePendientes) return false;
  if (hastaPendientes && fecha > hastaPendientes) return false;

  return true;
});

function obtenerEstado(fechaPagoOrden: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fecha = new Date(`${fechaPagoOrden}T00:00:00`);
  fecha.setHours(0, 0, 0, 0);

  if (fecha <= hoy) {
    return "pagar";
  }

  return "pendiente";
}



async function confirmarPago() {
  if (!pagoSeleccionado) return;

  setProcesandoPago(true);

  const fechaPago = new Date().toISOString();

  const { error } = await supabase
    .from("reservation_payments")
    .update({
      owner_payment_status: "pagado",
      owner_paid_at: fechaPago,
    })
    .eq("id", pagoSeleccionado.id);

  if (error) {
    alert("Error al registrar el pago.");
    console.error(error);
    setProcesandoPago(false);
    return;
  }

  try {
    await enviarEmailPagoPropietario(
      pagoSeleccionado.id
    );
  } catch (error) {
    console.error(
      "ERROR ENVIANDO EMAIL DE PAGO:",
      error
    );

    alert(
      "El pago fue registrado correctamente, pero no se pudo enviar el email al propietario."
    );
  }

  setPagoSeleccionado(null);
  setProcesandoPago(false);

  obtenerPagos();
}

  return (
    <main
      style={{
        padding: "30px",
        color: "#FFFFFF",
      }}
    >
      <button
        onClick={() =>
          (window.location.href = "/admin")
        }
        style={{
          background: "transparent",
          color: "#FF7A00",
          border: "1px solid #FF7A00",
          borderRadius: "8px",
          padding: "8px 14px",
          cursor: "pointer",
          marginBottom: "25px",
        }}
      >
        ← Volver a Administración
      </button>

      <h1
        style={{
          marginBottom: "10px",
        }}
      >
        🏦 Pagos a propietarios
      </h1>

      <p
        style={{
          color: "#999",
          marginBottom: "30px",
        }}
      >
        Transferencias pendientes e historial de pagos
        realizados a propietarios.
      </p>

      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #222",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
            }}
          >
            Pagos pendientes
          </h2>
        </div>

        <div
          style={{
            overflowX: "auto",
          }}
        >

<div
  style={{
    display: "flex",
    gap: "15px",
    padding: "20px",
    borderBottom: "1px solid #222",
    flexWrap: "wrap",
    alignItems: "end",
  }}
>
  <div>
    <label
      style={{
        display: "block",
        color: "#999",
        fontSize: "12px",
        marginBottom: "6px",
      }}
    >
      Desde
    </label>

    <input
      type="date"
      value={desdePendientes}
      onChange={(e) => setDesdePendientes(e.target.value)}
      style={{
        background: "#1A1A1A",
        color: "white",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "8px 10px",
      }}
    />
  </div>

  <div>
    <label
      style={{
        display: "block",
        color: "#999",
        fontSize: "12px",
        marginBottom: "6px",
      }}
    >
      Hasta
    </label>

    <input
      type="date"
      value={hastaPendientes}
      onChange={(e) => setHastaPendientes(e.target.value)}
      style={{
        background: "#1A1A1A",
        color: "white",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "8px 10px",
      }}
    />
  </div>

  <button
    onClick={() => {
      setDesdePendientes("");
      setHastaPendientes("");
    }}
    style={{
      background: "transparent",
      color: "#FF7A00",
      border: "1px solid #FF7A00",
      borderRadius: "8px",
      padding: "8px 14px",
      cursor: "pointer",
      height: "38px",
    }}
  >
    Limpiar
  </button>
</div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1400px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>
                  Fecha de pago
                </th>

                <th style={thStyle}>
                  Propietario
                </th>

                <th style={thStyle}>
                  Teléfono
                </th>

                <th style={thStyle}>
                  Mail
                </th>

                <th style={thStyle}>
                  Alias
                </th>

                <th style={thStyle}>
                  Fechas contratadas
                </th>

                <th style={thStyle}>
                  Publicación
                </th>

                <th style={thStyle}>
                  Reserva
                </th>

                <th style={thStyle}>
                  Importe
                </th>

                <th style={thStyle}>
                  Estado
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    style={tdStyle}
                  >
                    Cargando pagos...
                  </td>
                </tr>
              ) : pagosPendientesFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={tdStyle}
                  >
                    No hay pagos pendientes.
                  </td>
                </tr>
              ) : (
                pagosPendientesFiltrados.map((pago) => (
                  <tr key={pago.id}>
                    <td style={tdStyle}>
                      <strong>
                        {pago.fecha}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      {pago.propietario}
                    </td>

                    <td style={tdStyle}>
                      {pago.telefono}
                    </td>

                    <td style={tdStyle}>
                      {pago.mail}
                    </td>

                    <td style={tdStyle}>
                      {pago.alias}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection:
                            "column",
                          gap: "4px",
                        }}
                      >
                        {pago.fechaContratada
                          .map(
                            (
                              fecha: string,
                              i: number
                            ) => (
                              <span key={i}>
                                {fecha}
                              </span>
                            )
                          )}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {pago.publicacion}
                    </td>

                    <td style={tdStyle}>
                      {pago.reserva}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 600,
                      }}
                    >
                      {pago.importe}
                    </td>

                    <td style={tdStyle}>
  {obtenerEstado(pago.fechaPagoOrden) === "pendiente" ? (
    <span
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "999px",
        background: "#3a2f00",
        color: "#FFD54F",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      🟡 Pendiente
    </span>
  ) : (
    <button
      onClick={() => setPagoSeleccionado(pago)}
      style={{
        background: "#16A34A",
        color: "white",
        border: "none",
        borderRadius: "999px",
        padding: "6px 12px",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "13px",
      }}
    >
      💸 Pagar
    </button>
  )}
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
            </div>

      {pagoSeleccionado && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#111",
              border: "1px solid #333",
              borderRadius: "16px",
              width: "420px",
              maxWidth: "90%",
              padding: "25px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "10px",
              }}
            >
              Confirmar pago
            </h2>

            <p
              style={{
                color: "#999",
                fontSize: "14px",
                marginBottom: "25px",
              }}
            >
              Verificá los datos antes de confirmar la transferencia.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div>
                <div style={modalLabelStyle}>
                  Propietario
                </div>

                <div style={modalValueStyle}>
                  {pagoSeleccionado.propietario}
                </div>
              </div>

              <div>
                <div style={modalLabelStyle}>
                  Teléfono
                </div>

                <div style={modalValueStyle}>
                  {pagoSeleccionado.telefono}
                </div>
              </div>

              <div>
                <div style={modalLabelStyle}>
                  Mail
                </div>

                <div style={modalValueStyle}>
                  {pagoSeleccionado.mail}
                </div>
              </div>

              <div>
                <div style={modalLabelStyle}>
                  Alias
                </div>

                <div
                  style={{
                    ...modalValueStyle,
                    color: "#FF7A00",
                    fontWeight: 700,
                  }}
                >
                  {pagoSeleccionado.alias}
                </div>
              </div>

              <div>
                <div style={modalLabelStyle}>
                  Publicación
                </div>

                <div style={modalValueStyle}>
                  {pagoSeleccionado.publicacion}
                </div>
              </div>

              <div>
                <div style={modalLabelStyle}>
                  Importe a transferir
                </div>

                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#4ADE80",
                  }}
                >
                  {pagoSeleccionado.importe}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "30px",
              }}
            >
              <button
                onClick={() => setPagoSeleccionado(null)}
                disabled={procesandoPago}
                style={{
                  background: "transparent",
                  color: "#999",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>

              <button
                onClick={confirmarPago}
                disabled={procesandoPago}
                style={{
                  background: "#16A34A",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  cursor: procesandoPago
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: 700,
                }}
              >
                {procesandoPago
                  ? "Procesando..."
                  : "Confirmar pago"}
              </button>
            </div>
          </div>
        </div>
            )}

      {/* HISTORIAL DE PAGOS */}

      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: "12px",
          overflow: "hidden",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #222",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
            }}
          >
            Historial de pagos realizados
          </h2>
        </div>

        <div
  style={{
    display: "flex",
    gap: "15px",
    padding: "20px",
    borderBottom: "1px solid #222",
    flexWrap: "wrap",
    alignItems: "end",
  }}
>
  <div>
    <label
      style={{
        display: "block",
        color: "#999",
        fontSize: "12px",
        marginBottom: "6px",
      }}
    >
      Desde
    </label>

    <input
      type="date"
      value={desdeHistorial}
      onChange={(e) =>
        setDesdeHistorial(e.target.value)
      }
      style={{
        background: "#1A1A1A",
        color: "white",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "8px 10px",
      }}
    />
  </div>

  <div>
    <label
      style={{
        display: "block",
        color: "#999",
        fontSize: "12px",
        marginBottom: "6px",
      }}
    >
      Hasta
    </label>

    <input
      type="date"
      value={hastaHistorial}
      onChange={(e) =>
        setHastaHistorial(e.target.value)
      }
      style={{
        background: "#1A1A1A",
        color: "white",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "8px 10px",
      }}
    />
  </div>

  <button
    onClick={() => {
      setDesdeHistorial("");
      setHastaHistorial("");
    }}
    style={{
      background: "transparent",
      color: "#FF7A00",
      border: "1px solid #FF7A00",
      borderRadius: "8px",
      padding: "8px 14px",
      cursor: "pointer",
      height: "38px",
    }}
  >
    Limpiar
  </button>
</div>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1400px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Fecha de pago</th>
                <th style={thStyle}>Propietario</th>
                <th style={thStyle}>Teléfono</th>
                <th style={thStyle}>Mail</th>
                <th style={thStyle}>Alias</th>
                <th style={thStyle}>Publicación</th>
                <th style={thStyle}>Reserva</th>
                <th style={thStyle}>Importe</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>

            <tbody>
              {loadingHistorial ? (
                <tr>
                  <td colSpan={9} style={tdStyle}>
                    Cargando historial...
                  </td>
                </tr>
              ) : pagosHistorial.length === 0 ? (
                <tr>
                  <td colSpan={9} style={tdStyle}>
                    No hay pagos realizados.
                  </td>
                </tr>
              ) : (
                pagosHistorialFiltrados.map((pago: any) => {
                  const propietario = Array.isArray(pago.owner)
                    ? pago.owner[0]
                    : pago.owner;

                  const publicacion = Array.isArray(pago.publications)
                    ? pago.publications[0]
                    : pago.publications;

                  return (
                    <tr key={pago.id}>
                      <td style={tdStyle}>
                        {pago.owner_paid_at
                          ? new Date(
                              pago.owner_paid_at
                            ).toLocaleDateString("es-AR")
                          : "-"}
                      </td>

                      <td style={tdStyle}>
                        {propietario?.nombre || "-"}
                      </td>

                      <td style={tdStyle}>
                        {propietario?.telefono || "-"}
                      </td>

                      <td style={tdStyle}>
                        {propietario?.email || "-"}
                      </td>

                      <td style={tdStyle}>
                        {publicacion?.alias_pago || "-"}
                      </td>

                      <td style={tdStyle}>
                        {publicacion?.titulo || "-"}
                      </td>

                      <td style={tdStyle}>
                        #{String(pago.reservation_id).slice(0, 8)}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 600,
                        }}
                      >
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          maximumFractionDigits: 0,
                        }).format(Number(pago.importePropietario || 0))}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            background: "#16351F",
                            color: "#4ADE80",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          🟢 Pagado
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  color: "#999",
  fontSize: "13px",
  fontWeight: 500,
  borderBottom: "1px solid #222",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "16px",
  borderBottom: "1px solid #1d1d1d",
  fontSize: "14px",
  whiteSpace: "nowrap",
};

const modalLabelStyle: React.CSSProperties = {
  color: "#777",
  fontSize: "12px",
  marginBottom: "3px",
};

const modalValueStyle: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: "15px",
};