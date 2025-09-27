/**
 * Updated frontend function for batch trade submission
 * แทนที่ function postTradeData() ที่มีอยู่ใน index.html
 */

/**
 * วนลูปเก็บข้อมูลจากทุกรายการ และส่งไปยัง App Script แบบ batch
 */
async function postTradeDataBatch(event) {
    event.preventDefault();
    const submitButton = document.getElementById('submitButton');
    const statusMessage = document.getElementById('submissionStatus');
    const container = document.getElementById('tradeEntriesContainer');
    const tradeEntryBlocks = container.querySelectorAll('.trade-entry-block');
    
    if (tradeEntryBlocks.length === 0) {
        statusMessage.textContent = '❌ ไม่มีรายการเทรดให้บันทึก';
        statusMessage.classList.remove('hidden', 'text-green-600');
        statusMessage.classList.add('text-red-500', 'bg-red-100');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = `กำลังเตรียมข้อมูล ${tradeEntryBlocks.length} รายการ...`;
    statusMessage.classList.add('hidden');

    if (APPS_SCRIPT_URL === 'YOUR_DEPLOYED_WEB_APP_URL') {
        statusMessage.textContent = "❌ กรุณาเปลี่ยน APPS_SCRIPT_URL ในโค้ดก่อนใช้งานจริง";
        statusMessage.classList.remove('hidden', 'text-green-600');
        statusMessage.classList.add('text-red-500', 'bg-red-100');
        submitButton.disabled = false;
        submitButton.textContent = 'บันทึกรายการเทรดทั้งหมด';
        return;
    }

    try {
        // รวบรวมข้อมูลจากทุกบล็อกเป็น array
        const tradesData = [];
        
        for (let i = 0; i < tradeEntryBlocks.length; i++) {
            const block = tradeEntryBlocks[i];
            const data = {
                accountId: block.querySelector('[name="accountId"]').value,
                assetId: block.querySelector('[name="assetId"]').value,
                startBalance: block.querySelector('[name="startBalance"]').value,
                dailyProfit: block.querySelector('[name="dailyProfit"]').value,
                lotSize: block.querySelector('[name="lotSize"]').value,
                notes: block.querySelector('[name="notes"]').value,
            };
            
            // Validate data
            if (!data.accountId || !data.assetId || !data.startBalance || !data.dailyProfit || !data.lotSize) {
                throw new Error(`รายการ #${i + 1} ข้อมูลไม่ครบถ้วน`);
            }
            
            tradesData.push(data);
        }

        submitButton.textContent = `กำลังส่งข้อมูล ${tradesData.length} รายการ...`;

        // ส่งข้อมูลแบบ batch
        const formData = new URLSearchParams();
        formData.append('action', 'addMultipleTrades');
        formData.append('tradesData', JSON.stringify(tradesData));

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData,
        });
        
        const result = await response.json();
        
        // แสดงผลตามสถานะ
        if (result.status === 'success') {
            statusMessage.textContent = `✅ ${result.message}`;
            statusMessage.classList.remove('hidden', 'text-red-500', 'bg-red-100', 'text-yellow-600', 'bg-yellow-100');
            statusMessage.classList.add('text-green-600', 'bg-green-100');
            
            // ล้างฟอร์มทั้งหมดหลังบันทึกสำเร็จ
            container.innerHTML = '';
            entryCounter = 0;
            addTradeEntry(); // เพิ่มรายการแรกกลับมา
            
            // รีเฟรช trading history
            if (currentUser) {
                await loadTradingHistory(currentUser['Account ID']);
            }
            
        } else if (result.status === 'partial') {
            statusMessage.textContent = `⚠️ ${result.message}`;
            statusMessage.classList.remove('hidden', 'text-green-600', 'bg-green-100', 'text-red-500', 'bg-red-100');
            statusMessage.classList.add('text-yellow-600', 'bg-yellow-100');
            
            // แสดงรายละเอียดข้อผิดพลาด
            console.log('Batch submission details:', result);
            
            // เปลี่ยนสีขอบของรายการที่ผิดพลาด
            result.results.forEach((item, index) => {
                const block = tradeEntryBlocks[index];
                if (block) {
                    if (item.status === 'success') {
                        block.style.borderColor = '#34D399'; // green
                    } else {
                        block.style.borderColor = '#EF4444'; // red
                    }
                }
            });
            
        } else {
            statusMessage.textContent = `❌ ${result.message}`;
            statusMessage.classList.remove('hidden', 'text-green-600', 'bg-green-100', 'text-yellow-600', 'bg-yellow-100');
            statusMessage.classList.add('text-red-500', 'bg-red-100');
        }

    } catch (error) {
        statusMessage.textContent = `❌ ข้อผิดพลาด: ${error.message}`;
        statusMessage.classList.remove('hidden', 'text-green-600', 'bg-green-100', 'text-yellow-600', 'bg-yellow-100');
        statusMessage.classList.add('text-red-500', 'bg-red-100');
        console.error('Error in batch submission:', error);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'บันทึกรายการเทรดทั้งหมด';
    }
}

/**
 * ฟังก์ชันสำหรับส่งทีละรายการ (เก็บไว้เป็น fallback)
 */
async function postTradeDataIndividual(event) {
    // นี่คือ function เดิมที่มีอยู่ใน index.html
    // สามารถเก็บไว้เป็น backup หรือให้ user เลือกได้
}

// เพิ่มใน DOMContentLoaded event listener:
// document.getElementById('tradeForm').addEventListener('submit', postTradeDataBatch);