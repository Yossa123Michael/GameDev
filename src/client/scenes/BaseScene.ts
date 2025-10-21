// File: src/client/scenes/BaseScene.ts
import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;
  protected musicButton!: Phaser.GameObjects.Text; // Tambahkan properti untuk tombol musik
  protected backButton!: Phaser.GameObjects.Text; // Tambahkan properti untuk tombol kembali

  // Tambahkan preload untuk background
  preload() {
    this.load.image('background', 'assets/bg.png'); // Muat gambar background
  }

  create() {
    // Setel nilai awal
    this.updateCenter();

    // Tambahkan background image dan sesuaikan skala/posisi
    const bg = this.add.image(this.centerX, this.centerY, 'background');
    bg.setDisplaySize(this.scale.width, this.scale.height); // Sesuaikan ukuran dengan layar

    // Dengarkan event resize dari Phaser
    this.scale.on('resize', this.handleResize, this);

    // Buat tombol umum (kecuali MainMenuScene)
    if (this.scene.key !== 'MainMenuScene') {
      this.createCommonButtons();
    }
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    // Perbarui nilai tengah
    this.updateCenter();

    // Atur ulang posisi background
    const bg = this.children.getByName('background'); // Cari background jika ada
    if (bg instanceof Phaser.GameObjects.Image) {
      bg.setPosition(this.centerX, this.centerY);
      bg.setDisplaySize(gameSize.width, gameSize.height);
    }

    // Atur ulang posisi tombol jika ada
    this.repositionCommonButtons();


    // Panggil fungsi draw ulang di scene anak
    if (typeof (this as any).draw === 'function') {
      (this as any).draw();
    }
  }

  private updateCenter() {
    this.centerX = this.scale.width / 2;
    this.centerY = this.scale.height / 2;
  }

   // Fungsi untuk membuat tombol-tombol umum
   protected createCommonButtons(backTargetScene: string = 'MainMenuScene') {
     // Tombol Musik 
     this.musicButton = this.add.text(this.scale.width * 0.9, this.scale.height * 0.1, 'Musik: On', {
       fontSize: '24px',
       color: '#000000',
       backgroundColor: '#ffffff',
       padding: { x: 10, y: 5 }
     }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

     this.musicButton.on('pointerdown', () => {
       // Logika toggle musik (sementara hanya ganti teks)
       const currentText = this.musicButton.text;
       this.musicButton.setText(currentText === 'Musik: On' ? 'Musik: Off' : 'Musik: On');
       // TODO: Implementasikan logika audio sebenarnya
     });

     // Tombol Kembali (jika bukan Main Menu) 
     if (this.scene.key !== 'MainMenuScene') {
        // Tentukan scene tujuan berdasarkan scene saat ini jika tidak dispesifikasikan
        let targetScene = backTargetScene;
        if (this.scene.key === 'PilihModeScene') targetScene = 'MainMenuScene';
        else if (this.scene.key === 'PilihKesulitanScene') targetScene = 'PilihModeScene';
        else if (this.scene.key === 'GameScene') targetScene = 'PilihKesulitanScene'; // Asumsi kembali ke pilih kesulitan
        // ... tambahkan logika untuk scene lain jika perlu

         this.backButton = this.add.text(this.scale.width * 0.1, this.scale.height * 0.1, '< Kembali', {
           fontSize: '24px',
           color: '#000000',
           backgroundColor: '#ffffff',
           padding: { x: 10, y: 5 }
         }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

         this.backButton.on('pointerdown', () => {
            // Coba ambil mode & difficulty dari data scene jika kembali ke PilihKesulitan
            if (targetScene === 'PilihKesulitanScene' && (this as any).mode) {
                 this.scene.start(targetScene, { mode: (this as any).mode });
            } else {
                 this.scene.start(targetScene);
            }
         });
     }
   }

    // Fungsi untuk mengatur ulang posisi tombol saat resize
    protected repositionCommonButtons() {
        if (this.musicButton) {
            this.musicButton.setPosition(this.scale.width * 0.9, this.scale.height * 0.1);
        }
        if (this.backButton) {
            this.backButton.setPosition(this.scale.width * 0.1, this.scale.height * 0.1);
        }
    }


  // Fungsi `draw` ini akan kita panggil di anak
  // Ini membersihkan elemen scene anak, tapi *tidak* tombol umum atau background
  public draw() {
    // Hapus semua elemen KECUALI background dan tombol umum
    this.children.list.forEach(child => {
      if (child !== this.musicButton && child !== this.backButton && child.name !== 'background') {
        child.destroy();
      }
    });
  }
}
