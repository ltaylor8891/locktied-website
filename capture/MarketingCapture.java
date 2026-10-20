package com.between.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.*;
import android.view.MotionEvent;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.*;
import org.junit.runner.RunWith;
import java.io.*;
import java.nio.file.Files;
import java.util.*;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.matcher.ViewMatchers.withText;

/** Local marketing fixture: actual 0.19 app rendering, no sends or backend changes. */
@RunWith(AndroidJUnit4.class)
public class MarketingCapture {
    @Rule public ExperienceFixture experience = new ExperienceFixture();
    private Context c(){return InstrumentationRegistry.getInstrumentation().getTargetContext();}
    private static void set(MainActivity activity,String name,Object value)throws Exception{
        java.lang.reflect.Field field=MainActivity.class.getDeclaredField(name);field.setAccessible(true);field.set(activity,value);
    }
    private static Object get(MainActivity activity,String name)throws Exception{
        java.lang.reflect.Field field=MainActivity.class.getDeclaredField(name);field.setAccessible(true);return field.get(activity);
    }
    private static void page(MainActivity activity,String name)throws Exception{
        java.lang.reflect.Method method=MainActivity.class.getDeclaredMethod(name);method.setAccessible(true);method.invoke(activity);
    }
    private void shot(String name)throws Exception{
        InstrumentationRegistry.getInstrumentation().waitForIdleSync();
        InstrumentationRegistry.getInstrumentation().getUiAutomation().waitForIdle(500,3000);
        Bitmap image=InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
        image.setHasAlpha(false);
        try(FileOutputStream out=new FileOutputStream(new File(c().getExternalFilesDir(null),"website-"+name+".png"))){image.compress(Bitmap.CompressFormat.PNG,100,out);}
    }
    private void compose(ActivityScenario<MainActivity> scenario,Bitmap photo,String text,String kind)throws Exception{
        scenario.onActivity(activity->{try{
            set(activity,"note",null);set(activity,"doodle",null);set(activity,"screen","home");
            set(activity,"photo",photo);set(activity,"draftText",text);set(activity,"kind",kind);
            set(activity,"restoredDoodle",null);set(activity,"drawingState",null);set(activity,"preview",null);
            set(activity,"bordered",false);set(activity,"toolsExpanded",true);set(activity,"paper",0xFFFAF7F0);
            EditorStyle style=new EditorStyle();style.textSize=64;set(activity,"editorStyle",style);
            page(activity,"compose");
        }catch(Exception e){throw new AssertionError(e);}});
    }
    private static void stroke(DoodleView view,float... points){
        long now=android.os.SystemClock.uptimeMillis();
        for(int i=0;i<points.length;i+=2){MotionEvent event=MotionEvent.obtain(now,now+i*10,i==0?MotionEvent.ACTION_DOWN:i==points.length-2?MotionEvent.ACTION_UP:MotionEvent.ACTION_MOVE,points[i]*view.getWidth(),points[i+1]*view.getHeight(),0);view.onTouchEvent(event);event.recycle();}
    }
    @Test public void captureWebsiteExamples()throws Exception{
        Assert.assertTrue("Only run on the dedicated Android emulator",android.os.Build.PRODUCT.contains("sdk"));
        Context context=c();SharedPreferences prefs=LocalState.prefs(context);Map<String,?> original=new HashMap<>(prefs.getAll());
        List<File> files=Arrays.asList(LocalState.file(context),LocalState.sentFile(context),new File(context.getCacheDir(),"draft-photo.png"),new File(context.getCacheDir(),"draft-doodle.png"),new File(context.getCacheDir(),"draft-drawing.bin"));
        Map<File,byte[]> backup=new LinkedHashMap<>();for(File file:files)backup.put(file,file.exists()?Files.readAllBytes(file.toPath()):null);
        Bitmap dog=BitmapFactory.decodeFile(new File(context.getExternalFilesDir(null),"website-beach-dog.webp").getPath());
        Bitmap coffee=BitmapFactory.decodeFile(new File(context.getExternalFilesDir(null),"website-coffee-date.webp").getPath());
        Assert.assertNotNull(dog);Assert.assertNotNull(coffee);
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            scenario.onActivity(activity->{try{
                for(String name:new String[]{"userListener","inboxListener"}){
                    com.google.firebase.firestore.ListenerRegistration listener=(com.google.firebase.firestore.ListenerRegistration)get(activity,name);if(listener!=null)listener.remove();set(activity,name,null);
                }
                String pair="00000000-0000-0000-0000-000000000019";set(activity,"pairId",pair);
                prefs.edit().putString("pairId",pair).putString("status","Saved in LockTied").commit();
                LocalState.save(context,Artwork.encode(Artwork.compose("",dog,null,Artwork.PAPERS[0],false)),pair,1,"photo",System.currentTimeMillis());
                LocalState.saveSent(context,Artwork.encode(Artwork.compose("Coffee date?\nYou, me & no plans.",coffee,null,Artwork.PAPERS[0],false)),pair,"website-local-fixture",prefs.getLong("generation",0),false);
                page(activity,"home");
            }catch(Exception e){throw new AssertionError(e);}});
            shot("home");
            compose(scenario,coffee,"Coffee date?\nYou, me & no plans.","note");shot("note");
            compose(scenario,dog,"","photo");shot("photo");
            compose(scenario,dog,"10/10 good boy","doodle");
            scenario.onActivity(activity->{try{
                DoodleView drawing=(DoodleView)get(activity,"doodle");drawing.ink=Color.WHITE;drawing.size=12;drawing.brushType=0;
                stroke(drawing,.50f,.29f,.37f,.23f,.30f,.16f,.31f,.11f,.36f,.08f,.42f,.09f,.50f,.15f,.58f,.09f,.64f,.08f,.69f,.11f,.70f,.16f,.63f,.23f,.50f,.29f);
                stroke(drawing,.25f,.11f,.20f,.08f);stroke(drawing,.75f,.11f,.80f,.08f);
            }catch(Exception e){throw new AssertionError(e);}});
            shot("doodle");
            onView(withText("Preview & send")).perform(click());shot("preview");
        }finally{
            SharedPreferences.Editor restore=prefs.edit().clear();
            for(Map.Entry<String,?> entry:original.entrySet()){
                Object value=entry.getValue();String key=entry.getKey();
                if(value instanceof String)restore.putString(key,(String)value);else if(value instanceof Long)restore.putLong(key,(Long)value);else if(value instanceof Integer)restore.putInt(key,(Integer)value);else if(value instanceof Boolean)restore.putBoolean(key,(Boolean)value);else if(value instanceof Float)restore.putFloat(key,(Float)value);else if(value instanceof Set)restore.putStringSet(key,(Set<String>)value);
            }
            restore.commit();
            for(Map.Entry<File,byte[]> entry:backup.entrySet()){if(entry.getValue()==null)entry.getKey().delete();else Files.write(entry.getKey().toPath(),entry.getValue());}
        }
    }
}
