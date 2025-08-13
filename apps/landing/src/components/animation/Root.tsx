import { Composition } from 'remotion';
import { DataCenterRackEducation } from './DataCenterRackAnimation';
import { ServerModuleCombined } from './ServerModuleCombined';
import { DataCenterEducation3D } from './compositions/DataCenterEducation3D';
import { ServerRack3D } from './3d/ServerRack3D';
import { DataCenterOverview3D } from './3d/DataCenterOverview3D';
import { CoolingSystem3D } from './3d/CoolingSystem3D';
import { PowerSystem3D } from './3d/PowerSystem3D';
import { NetworkTopology3D } from './3d/NetworkTopology3D';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Educational Video */}
      <Composition
        id="DataCenterEducation3D"
        component={DataCenterEducation3D}
        durationInFrames={3600} // 120 seconds (2 minutes) at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      
      {/* Individual 3D Components */}
      <Composition
        id="ServerRack3D"
        component={ServerRack3D}
        durationInFrames={360} // 12 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      
      <Composition
        id="DataCenterOverview3D"
        component={DataCenterOverview3D}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      
      <Composition
        id="CoolingSystem3D"
        component={CoolingSystem3D}
        durationInFrames={360} // 12 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      
      <Composition
        id="PowerSystem3D"
        component={PowerSystem3D}
        durationInFrames={360} // 12 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      
      <Composition
        id="NetworkTopology3D"
        component={NetworkTopology3D}
        durationInFrames={360} // 12 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      
      {/* Legacy Components */}
      <Composition
        id="DataCenterRack"
        component={DataCenterRackEducation}
        durationInFrames={600} // 20 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="ServerModule"
        component={ServerModuleCombined}
        durationInFrames={2700} // 90 seconds at 30fps (30s + 60s)
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};