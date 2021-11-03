package www.CCSApp.com;
//package io.ionic.starter;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.ahm.capacitor.camera.preview.CameraPreview;
import com.dutchconcepts.capacitor.barcodescanner.BarcodeScanner;
import java.util.ArrayList;
import com.pointlesspos.plugins.dsiemvandroid.dsiemvandroid;
import com.bluetoothserial.plugin.BluetoothSerial;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      add(CameraPreview.class);
      add(BarcodeScanner.class);
      add(dsiemvandroid.class);
      add(BluetoothSerial.class);
      }
    });
  }
}
