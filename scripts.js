const btcAddress = "15FxgA5mTtpvamiCi41CF3bieowZBF18eP";
const balanceDiv = document.getElementById("balance");
const txTable = document.getElementById("transactions");

// QR Code
QRCode.toCanvas(document.getElementById('qrcode'), btcAddress, { width: 200 }, err => {
    if (err) console.error(err);
});

// Ambil saldo
fetch(`https://blockchain.info/balance?active=${btcAddress}&cors=true`)
    .then(res => res.json())
    .then(data => {
        const info = data[btcAddress];
        const balanceBTC = info.final_balance / 1e8;
        balanceDiv.innerHTML = `Saldo: <strong>${balanceBTC} BTC</strong>`;
    })
    .catch(err => {
        console.error(err);
        balanceDiv.innerHTML = "Gagal memuat saldo";
    });

// Ambil transaksi lengkap
fetch(`https://blockchain.info/rawaddr/${btcAddress}?cors=true`)
    .then(res => res.json())
    .then(data => {
        txTable.innerHTML = "";

        data.txs.slice(0, 5).forEach(tx => {
            const date = new Date(tx.time * 1000).toLocaleString();
            const txHash = tx.hash;
            const shortHash = `${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 8)}`;
            const status = tx.block_height ? "Terkonfirmasi" : "Belum Terkonfirmasi";

            // List penerima rapi
            let outputsHTML = "<ul style='list-style:none;padding:0;margin:0;'>";
            tx.out.forEach(output => {
                const address = output.addr || "(Alamat Tidak Diketahui)";
                const valueBTC = (output.value / 1e8).toFixed(8);
                outputsHTML += `<li style="margin-bottom:5px;">
                    <span style="color:lightgreen;">${address}</span> 
                    <span style="color:#f7931a;font-weight:bold;">${valueBTC} BTC</span>
                </li>`;
            });
            outputsHTML += "</ul>";

            txTable.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td>
                        <span style="cursor:pointer;color:lightblue;"('${txHash}')">
                            ${shortHash}
                        </span>
                        >
                        <a href="https://www.blockchain.com/btc/tx/${txHash}" target="_blank" style="color:orange;">
                            🔗
                        </a>
                    </td>
                    <td>${outputsHTML}</td>
                    <td>${status}</td>
                </tr>
            `;
        });
    })
    .catch(err => {
        console.error(err);
        txTable.innerHTML = "<tr><td colspan='4'>Gagal memuat transaksi</td></tr>";
    });
