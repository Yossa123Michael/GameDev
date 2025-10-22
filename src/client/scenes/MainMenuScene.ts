// File: src/client/scenes/MainMenuScene.ts
import { BaseScene } from './BaseScene';

export class MainMenuScene extends BaseScene {
  constructor() {
    super('MainMenuScene');
  }

  public override create() {
    super.create();
    // this.draw() dipanggil oleh BaseScene
  }

  public override draw() {
    // 1. Panggil super.draw() PERTAMA untuk membersihkan group
    super.draw();
    if (!this.sceneContentGroup) return;

    // 2. HAPUS SEMUA LISTENER 'POINTER_DOWN' LAMA DARI SCENE
    // Ini PENTING untuk mencegah listener menumpuk setiap kali di-draw
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_OVER);
    this.input.off(Phaser.Input.Events.POINTER_OUT);
    this.input.setDefaultCursor('default'); // Reset kursor

    // 3. Buat elemen dan tambahkan ke group
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Road Knowledge', {
        fontSize: '48px', color: '#000000', align: 'center',
        stroke: '#ffffff', strokeThickness: 4
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    // Buat tombol
    const startButton = this.createButton(this.scale.height * 0.4, 'Start Test');
    const leaderboardButton = this.createButton(this.scale.height * 0.5, 'Leaderboard');
    const achievementButton = this.createButton(this.scale.height * 0.6, 'Achievement');
    const optionButton = this.createButton(this.scale.height * 0.7, 'Option');
    const creditButton = this.createButton(this.scale.height * 0.8, 'Credit');
    
    // Tambahkan tombol ke group
    this.sceneContentGroup.add(startButton);
    this.sceneContentGroup.add(leaderboardButton);
    this.sceneContentGroup.add(achievementButton);
    this.sceneContentGroup.add(optionButton);
    this.sceneContentGroup.add(creditButton);
    
    // Simpan semua tombol yang bisa diklik dalam array
    const buttons = [
        { container: startButton, action: () => this.scene.start('PilihModeScene') },
        { container: leaderboardButton, action: () => this.scene.start('LeaderboardScene') },
        { container: achievementButton, action: () => this.scene.start('AchievementScene') },
        { container: optionButton, action: () => this.scene.start('OptionScene') },
        { container: creditButton, action: () => this.scene.start('CreditScene') }
    ];

    // 4. Daftarkan LISTENER PADA SCENE (bukan pada container)
    
    // Event POINTER_DOWN
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        buttons.forEach(btn => {
            // Cek apakah pointer ada di dalam area tombol
            if (this.isPointerOver(pointer, btn.container)) {
                console.log(`Button "${btn.container.name}" DOWN`);
                const rect = btn.container.getAt(0) as Phaser.GameObjects.Rectangle;
                rect.setFillStyle(0xdddddd, 0.9); // Warna klik
                
                // Jalankan aksi setelah delay
                this.time.delayedCall(100, btn.action);
            }
        });
    });

    // Event POINTER_OVER dan POINTER_OUT
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onButton = false;
        buttons.forEach(btn => {
            const rect = btn.container.getAt(0) as Phaser.GameObjects.Rectangle;
            if (this.isPointerOver(pointer, btn.container)) {
                onButton = true;
                if (rect.fillColor !== 0xeeeeee) { // Hanya ubah jika belum hover
                   rect.setFillStyle(0xeeeeee, 0.9);
                }
            } else {
                 if (rect.fillColor !== 0xffffff) { // Hanya ubah jika belum normal
                    rect.setFillStyle(0xffffff, 0.9);
                 }
            }
        });
        this.input.setDefaultCursor(onButton ? 'pointer' : 'default');
    });

    // Event POINTER_OUT dari window (jika mouse keluar)
    this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         buttons.forEach(btn => {
             const rect = btn.container.getAt(0) as Phaser.GameObjects.Rectangle;
             rect.setFillStyle(0xffffff, 0.9); // Reset semua ke normal
         });
         this.input.setDefaultCursor('default');
    });
  }
  
  // Helper baru untuk cek pointer
  private isPointerOver(pointer: Phaser.Input.Pointer, container: Phaser.GameObjects.Container): boolean {
      // Dapatkan posisi dan ukuran container di dunia (setelah di-scale/diposisikan)
      const bounds = container.getBounds();
      // getBounds() sudah memperhitungkan posisi container
      return bounds.contains(pointer.x, pointer.y);
  }


  // --- FUNGSI createButton (DISEDERHANAKAN) ---
  // (Hanya membuat dan mengembalikan container, TIDAK menambahkan listener)
  createButton(y: number, text: string): Phaser.GameObjects.Container {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60;

    const buttonRect = this.add.rectangle(
        0, 0, buttonWidth, buttonHeight, 0xffffff, 0.9
    )
    .setStrokeStyle(2, 0x000000)
    .setOrigin(0, 0); // Origin kiri atas

    const buttonText = this.add.text(
        buttonWidth / 2, buttonHeight / 2, text,
        { fontSize: '24px', color: '#000000' }
    ).setOrigin(0.5); // Origin tengah

    const container = this.add.container(
        this.centerX - buttonWidth / 2, // Posisi X
        y - buttonHeight / 2          // Posisi Y
    );
    container.setSize(buttonWidth, buttonHeight); // Penting untuk getBounds()
    container.add([buttonRect, buttonText]);
    
    // Beri nama untuk debugging
    container.setName(text); 
    
    // **TIDAK ADA .setInteractive() di sini**
    // Interaktivitas ditangani oleh scene

    return container; // Kembalikan container
  }
}
