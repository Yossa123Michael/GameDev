import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  // Properti untuk menyimpan posisi tengah
  protected centerX!: number;
  protected centerY!: number;

  create() {
    // Panggil fungsi `create` di scene anak (jika ada)
    this.cameras.main.setBackgroundColor('#ffffff');

    // Setel nilai awal
    this.updateCenter();

    // Dengarkan event resize dari Phaser
    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    // Perbarui nilai tengah
    this.updateCenter();
    
    // Panggil fungsi draw ulang di scene anak
    if (typeof (this as any).draw === 'function') {
      (this as any).draw();
    }
  }

  private updateCenter() {
    this.centerX = this.scale.width / 2;
    this.centerY = this.scale.height / 2;
  }

  // Fungsi `draw` ini akan kita panggil di anak
  // Ini juga membersihkan layar untuk mencegah duplikat
  public draw() {
    this.children.removeAll(true);
  }
}
