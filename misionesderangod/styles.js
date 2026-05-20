export const misionesderangod2Styles = `
      #misionesderangod2-game-container {
        width: 100%;
        height: 100%;
        background: linear-gradient(160deg, #111827 0%, #0a0d14 100%);
        border-radius: 20px;
        box-shadow:
          0 0 0 1px rgba(255, 107, 0, 0.18),
          0 0 30px rgba(255, 107, 0, 0.08),
          0 10px 40px rgba(0,0,0,0.7);
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
        font-family: 'Segoe UI', 'Arial Black', sans-serif;
      }

      .misionesderangod2-screen {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: transparent;
        transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .misionesderangod2-screen.misionesderangod2-hidden {
        opacity: 0;
        pointer-events: none;
        transform: scale(0.95);
        display: none;
      }

      .misionesderangod2-menu-button,
      .misionesderangod2-rank-button,
      .misionesderangod2-back-button {
        border-radius: 30px;
        padding: 12px 8px;
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.1s ease;
        box-sizing: border-box;
        width: 100%;
        flex-shrink: 0;
      }

      .misionesderangod2-menu-button:active,
      .misionesderangod2-rank-button:active,
      .misionesderangod2-back-button:active {
        transform: translateY(2px);
      }

      .misionesderangod2-menu-button {
        background: linear-gradient(135deg, #1e2d45 0%, #162036 100%);
        border: 2px solid #FF6B00;
        color: #FF8C30;
        box-shadow: 0 4px 0 #7a3300, inset 0 1px 0 rgba(255,150,50,0.15);
        text-shadow: 0 0 10px rgba(255,107,0,0.5);
      }
      .misionesderangod2-menu-button:active {
        box-shadow: none;
      }

      .misionesderangod2-rank-d {
        background: linear-gradient(135deg, #0d2010 0%, #0a1a0d 100%);
        border: 2px solid #2e7d32;
        color: #4caf50;
        box-shadow: 0 4px 0 #1b4020, 0 0 8px rgba(46,125,50,0.2), inset 0 1px 0 rgba(100,200,100,0.1);
      }
      .misionesderangod2-rank-c {
        background: linear-gradient(135deg, #0a1a2e 0%, #071525 100%);
        border: 2px solid #0277bd;
        color: #29b6f6;
        box-shadow: 0 4px 0 #014a75, 0 0 8px rgba(2,119,189,0.2), inset 0 1px 0 rgba(50,150,255,0.1);
      }
      .misionesderangod2-rank-b {
        background: linear-gradient(135deg, #2a1800 0%, #1e1200 100%);
        border: 2px solid #ef6c00;
        color: #ffa726;
        box-shadow: 0 4px 0 #7a3500, 0 0 8px rgba(239,108,0,0.2), inset 0 1px 0 rgba(255,150,0,0.1);
      }
      .misionesderangod2-rank-a {
        background: linear-gradient(135deg, #2a0808 0%, #1e0505 100%);
        border: 2px solid #b71c1c;
        color: #ef5350;
        box-shadow: 0 4px 0 #6a0e0e, 0 0 8px rgba(183,28,28,0.25), inset 0 1px 0 rgba(255,80,80,0.1);
      }
      .misionesderangod2-rank-s {
        background: linear-gradient(135deg, #1e0a2e 0%, #150621 100%);
        border: 2px solid #7b1fa2;
        color: #ce93d8;
        box-shadow: 0 4px 0 #4a0e6e, 0 0 10px rgba(123,31,162,0.3), inset 0 1px 0 rgba(200,100,255,0.1);
      }

      .misionesderangod2-rank-button:active {
        box-shadow: none;
        transform: translateY(4px);
      }

      .misionesderangod2-mission-item {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 10px 10px;
        border-left: 6px solid;
        border-radius: 12px;
        cursor: pointer;
        font-size: 12px;
        line-height: 1.4;
        gap: 5px;
        position: relative;
        transition: all 0.15s ease;
      }

      .misionesderangod2-mission-item:not(.misionesderangod2-locked):active {
        transform: scale(0.98);
      }

      .misionesderangod2-missions-D .misionesderangod2-mission-item {
        background: linear-gradient(135deg, #0d2010 0%, #091509 100%);
        border-color: #2e7d32;
        border-top: 1px solid rgba(76,175,80,0.2);
        border-right: 1px solid rgba(76,175,80,0.12);
        border-bottom: 1px solid rgba(46,125,50,0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(46,125,50,0.1);
      }
      .misionesderangod2-missions-C .misionesderangod2-mission-item {
        background: linear-gradient(135deg, #0a1a2e 0%, #060f1e 100%);
        border-color: #0277bd;
        border-top: 1px solid rgba(41,182,246,0.2);
        border-right: 1px solid rgba(2,119,189,0.12);
        border-bottom: 1px solid rgba(2,119,189,0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(2,119,189,0.1);
      }
      .misionesderangod2-missions-B .misionesderangod2-mission-item {
        background: linear-gradient(135deg, #201000 0%, #160b00 100%);
        border-color: #ef6c00;
        border-top: 1px solid rgba(255,167,38,0.2);
        border-right: 1px solid rgba(239,108,0,0.12);
        border-bottom: 1px solid rgba(239,108,0,0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(239,108,0,0.1);
      }
      .misionesderangod2-missions-A .misionesderangod2-mission-item {
        background: linear-gradient(135deg, #200808 0%, #160404 100%);
        border-color: #b71c1c;
        border-top: 1px solid rgba(239,83,80,0.2);
        border-right: 1px solid rgba(183,28,28,0.12);
        border-bottom: 1px solid rgba(183,28,28,0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 6px rgba(183,28,28,0.1);
      }
      .misionesderangod2-missions-S .misionesderangod2-mission-item {
        background: linear-gradient(135deg, #160a20 0%, #0e0616 100%);
        border-color: #7b1fa2;
        border-top: 1px solid rgba(206,147,216,0.2);
        border-right: 1px solid rgba(123,31,162,0.12);
        border-bottom: 1px solid rgba(123,31,162,0.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 8px rgba(123,31,162,0.12);
      }

      .misionesderangod2-mission-header {
        text-align: center;
        font-weight: 800;
        font-size: 13px;
        margin-bottom: 3px;
        text-transform: uppercase;
        color: #e8e0d0;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      }

      .misionesderangod2-mission-details {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
      }

      .misionesderangod2-mission-left,
      .misionesderangod2-mission-right {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .misionesderangod2-mission-left span,
      .misionesderangod2-mission-right span {
        background: rgba(0,0,0,0.35);
        color: rgba(220,210,195,0.85);
        padding: 2px 6px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.06);
      }

      .misionesderangod2-mission-lock {
        text-align: center;
        background: rgba(150,20,20,0.3);
        color: #ff6b6b;
        border-radius: 20px;
        padding: 4px;
        font-size: 11px;
        font-weight: bold;
        border: 1px solid rgba(198,40,40,0.4);
      }

      .misionesderangod2-locked {
        opacity: 0.55;
        filter: grayscale(0.4);
      }

      .misionesderangod2-back-button {
        background: linear-gradient(135deg, #1a1f2e 0%, #111520 100%);
        border: 2px solid #37474f;
        color: #90a4ae;
        box-shadow: 0 3px 0 #1a2228, inset 0 1px 0 rgba(144,164,174,0.08);
        margin-top: 4px;
        font-size: 14px;
      }
      .misionesderangod2-back-button:active {
        box-shadow: none;
        transform: translateY(3px);
      }
    `;
